/**
 * Scraper Casas da Água - Extrai todos os produtos via API VTEX
 *
 * Estratégia: buscar por cada categoria PAI (14 categorias) com paginação até 2500 cada,
 * depois complementar com busca global. Deduplica por productId.
 *
 * Uso: node scripts/scraper.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://www.casasdaagua.com.br";
const BATCH_SIZE = 50;
const DELAY_MS = 350;
const OUTPUT_DIR = path.join(__dirname, "..", "src", "data");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      clearTimeout(timeout);

      if (response.status === 429) {
        const wait = attempt * 3000;
        console.log(`  ⏳ Rate limited. Aguardando ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (response.status === 404 || response.status === 400) return [];
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return await response.json();
    } catch (err) {
      if (attempt === retries) {
        console.error(`  ❌ Falha: ${url.slice(0, 120)}... - ${err.message}`);
        return [];
      }
      await sleep(attempt * 1500);
    }
  }
  return [];
}

// ── Buscar categorias ────────────────────────────────────────────────────

async function fetchCategories() {
  console.log("📂 Buscando categorias...");
  const tree = await fetchJSON(`${BASE_URL}/api/catalog_system/pub/category/tree/3`);
  const all = [];

  function flatten(nodes, parent = "") {
    for (const n of nodes) {
      all.push({ id: n.id, name: n.name, url: n.url, hasChildren: n.hasChildren, parent });
      if (n.children?.length) flatten(n.children, n.name);
    }
  }
  flatten(tree);
  console.log(`   ✅ ${all.length} categorias | ${tree.length} categorias raiz\n`);
  return { tree, all };
}

// ── Buscar produtos paginados ────────────────────────────────────────────

async function fetchPaginated(urlBase, label) {
  const products = [];
  let from = 0;

  while (true) {
    const to = from + BATCH_SIZE - 1;
    const url = `${urlBase}&_from=${from}&_to=${to}`;
    const batch = await fetchJSON(url);

    if (!batch || batch.length === 0) break;

    products.push(...batch);
    process.stdout.write(`   📦 ${label}: ${products.length} produtos\r`);

    if (batch.length < BATCH_SIZE || from + BATCH_SIZE >= 2500) break;
    from += BATCH_SIZE;
    await sleep(DELAY_MS);
  }

  if (products.length > 0) {
    process.stdout.write(`   📦 ${label}: ${products.length} produtos ✅\n`);
  }
  return products;
}

// ── Transformar produto ──────────────────────────────────────────────────

function transformProduct(p) {
  const item = p.items?.[0];
  const seller = item?.sellers?.[0];
  const offer = seller?.commertialOffer;
  if (!item || !offer) return null;

  const price = offer.Price;
  const listPrice = offer.ListPrice;
  const discount = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;

  const best = (offer.Installments || [])
    .filter((i) => i.InterestRate === 0 && i.NumberOfInstallments > 1)
    .sort((a, b) => b.NumberOfInstallments - a.NumberOfInstallments)[0];

  const images = (item.images || []).map((img) => img.imageUrl.replace("http://", "https://"));

  const specs = {};
  for (const key of p.allSpecifications || []) {
    if (Array.isArray(p[key])) specs[key] = p[key].join(", ");
  }

  const catParts = (p.categories?.[0] || "").split("/").filter(Boolean);
  const mainCat = catParts[0] || "Outros";
  const subCat = catParts[1] || "";
  const catSlug = mainCat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    id: p.productId,
    slug: p.linkText,
    name: p.productName,
    brand: p.brand || "",
    category: mainCat,
    subCategory: subCat,
    categorySlug: catSlug,
    categoryId: p.categoryId,
    description: p.description || p.metaTagDescription || "",
    specifications: specs,
    images,
    price,
    priceFrom: listPrice > price ? listPrice : undefined,
    discount: discount > 0 ? discount : undefined,
    installments: best ? { count: best.NumberOfInstallments, value: best.Value } : undefined,
    sku: item.itemId,
    skuName: item.name,
    ean: item.ean || undefined,
    inStock: offer.IsAvailable,
    availableQuantity: offer.AvailableQuantity,
    productReference: p.productReference || undefined,
    measurementUnit: item.measurementUnit || undefined,
    unitMultiplier: item.unitMultiplier || undefined,
    link: p.link,
    isBestSeller: !!p.productClusters?.["144"],
  };
}

// ── MAIN ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  🏪 SCRAPER CASAS DA ÁGUA - Extração de Produtos");
  console.log("═══════════════════════════════════════════════════════\n");

  const startTime = Date.now();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Categorias
  const { tree, all } = await fetchCategories();
  fs.writeFileSync(path.join(OUTPUT_DIR, "categories.json"), JSON.stringify(all, null, 2));

  // 2. Buscar por CADA categoria raiz (14 categorias, até 2500 produtos cada = 35000 máx teórico)
  const allMap = new Map();

  console.log("🔍 Extraindo produtos por categoria raiz...\n");
  for (const rootCat of tree) {
    const products = await fetchPaginated(
      `${BASE_URL}/api/catalog_system/pub/products/search/?fq=C:/${rootCat.id}/`,
      rootCat.name
    );
    for (const p of products) {
      if (!allMap.has(p.productId)) allMap.set(p.productId, p);
    }
    await sleep(500);
  }

  console.log(`\n📊 Após categorias raiz: ${allMap.size} produtos únicos\n`);

  // 3. Buscar subcategorias que possam ter muitos produtos (para pegar além do limite 2500)
  const largeCats = all.filter((c) => !c.hasChildren);
  console.log(`🔍 Extraindo por ${largeCats.length} subcategorias...\n`);

  for (const cat of largeCats) {
    const products = await fetchPaginated(
      `${BASE_URL}/api/catalog_system/pub/products/search/?fq=C:/${cat.id}/`,
      cat.name
    );
    for (const p of products) {
      if (!allMap.has(p.productId)) allMap.set(p.productId, p);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n📊 Após subcategorias: ${allMap.size} produtos únicos\n`);

  // 4. Busca global complementar
  console.log("🌐 Busca global complementar...\n");
  const globalProducts = await fetchPaginated(
    `${BASE_URL}/api/catalog_system/pub/products/search/?`,
    "Global"
  );
  for (const p of globalProducts) {
    if (!allMap.has(p.productId)) allMap.set(p.productId, p);
  }

  console.log(`\n📊 TOTAL FINAL: ${allMap.size} produtos únicos\n`);

  // 5. Transformar
  console.log("🔄 Transformando dados...\n");
  const products = Array.from(allMap.values()).map(transformProduct).filter(Boolean);
  console.log(`✅ ${products.length} produtos transformados\n`);

  // 6. Estatísticas
  const brands = new Set(products.map((p) => p.brand)).size;
  const cats = new Set(products.map((p) => p.category)).size;
  const inStock = products.filter((p) => p.inStock).length;
  const withDiscount = products.filter((p) => p.discount).length;

  console.log("📈 ESTATÍSTICAS:");
  console.log(`   Produtos:    ${products.length}`);
  console.log(`   Marcas:      ${brands}`);
  console.log(`   Categorias:  ${cats}`);
  console.log(`   Em estoque:  ${inStock}`);
  console.log(`   Com desconto:${withDiscount}\n`);

  // 7. Salvar
  const outFull = path.join(OUTPUT_DIR, "products.json");
  fs.writeFileSync(outFull, JSON.stringify(products, null, 2));
  console.log(`💾 products.json (${(fs.statSync(outFull).size / 1024 / 1024).toFixed(2)} MB)`);

  const lite = products.map((p) => ({
    id: p.id, slug: p.slug, name: p.name, brand: p.brand,
    category: p.category, categorySlug: p.categorySlug,
    images: p.images.slice(0, 1), price: p.price,
    priceFrom: p.priceFrom, discount: p.discount,
    installments: p.installments, inStock: p.inStock,
    isBestSeller: p.isBestSeller,
  }));
  const outLite = path.join(OUTPUT_DIR, "products-lite.json");
  fs.writeFileSync(outLite, JSON.stringify(lite));
  console.log(`💾 products-lite.json (${(fs.statSync(outLite).size / 1024 / 1024).toFixed(2)} MB)`);

  // Índice por categoria
  const byCat = {};
  for (const p of products) {
    if (!byCat[p.categorySlug]) byCat[p.categorySlug] = [];
    byCat[p.categorySlug].push(p.id);
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, "products-by-category.json"), JSON.stringify(byCat, null, 2));
  console.log(`💾 products-by-category.json`);

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n⏱️  Tempo: ${elapsed} min`);
  console.log("\n✅ EXTRAÇÃO COMPLETA!\n");
}

main().catch(console.error);
