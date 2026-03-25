import productsLite from "@/data/products-lite.json";
import productsByCategory from "@/data/products-by-category.json";

export interface ProductLite {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  images: string[];
  price: number;
  priceFrom?: number;
  discount?: number;
  installments?: { count: number; value: number };
  inStock: boolean;
  isBestSeller?: boolean;
}

// Aplica 60% de desconto em todos os produtos
function applyGlobalDiscount(products: ProductLite[]): ProductLite[] {
  return products.map((p) => {
    const originalPrice = p.priceFrom || p.price;
    const discountedPrice = Math.round(originalPrice * 0.4 * 100) / 100;
    return {
      ...p,
      priceFrom: originalPrice,
      price: discountedPrice,
      discount: 60,
      installments: p.installments
        ? { count: p.installments.count, value: Math.round((discountedPrice / p.installments.count) * 100) / 100 }
        : undefined,
    };
  });
}

// Todos os produtos (lite, para listagem) — com 60% OFF
export const allProducts: ProductLite[] = applyGlobalDiscount(productsLite as ProductLite[]);

// Índice por categoria
export const categoryIndex: Record<string, string[]> = productsByCategory as Record<string, string[]>;

// Produtos por categoria slug
export function getProductsByCategory(categorySlug: string): ProductLite[] {
  const ids = categoryIndex[categorySlug];
  if (!ids) return [];
  const idSet = new Set(ids);
  return allProducts.filter((p) => idSet.has(p.id));
}

// Produtos em estoque
export function getInStockProducts(): ProductLite[] {
  return allProducts.filter((p) => p.inStock);
}

// Best sellers
export function getBestSellers(limit = 20): ProductLite[] {
  return allProducts.filter((p) => p.isBestSeller && p.inStock).slice(0, limit);
}

// Com desconto
export function getDiscountedProducts(limit = 20): ProductLite[] {
  return allProducts
    .filter((p) => p.discount && p.discount > 0 && p.inStock)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, limit);
}

// Busca simples
export function searchProducts(query: string): ProductLite[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allProducts.filter(
    (p) =>
      p.inStock && (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
  );
}

// Buscar produto por slug (retorna dados completos do JSON grande)
export async function getProductBySlug(slug: string) {
  // Carrega dinamicamente para não pesar no bundle
  const products = (await import("@/data/products.json")).default;
  const product = products.find((p: { slug: string }) => p.slug === slug) || null;
  if (!product) return null;
  // Aplica 60% de desconto
  const originalPrice = product.priceFrom || product.price;
  const discountedPrice = Math.round(originalPrice * 0.4 * 100) / 100;
  return {
    ...product,
    priceFrom: originalPrice,
    price: discountedPrice,
    discount: 60,
    installments: product.installments
      ? { count: product.installments.count, value: Math.round((discountedPrice / product.installments.count) * 100) / 100 }
      : undefined,
  };
}

// Categorias únicas com contagem
export function getCategorySummary() {
  const map = new Map<string, { name: string; slug: string; count: number }>();
  for (const p of allProducts) {
    if (!p.inStock) continue;
    const existing = map.get(p.categorySlug);
    if (existing) {
      existing.count++;
    } else {
      map.set(p.categorySlug, { name: p.category, slug: p.categorySlug, count: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

// Marcas únicas por categoria
export function getBrandsByCategory(categorySlug: string): string[] {
  const products = getProductsByCategory(categorySlug).filter((p) => p.inStock);
  const brands = new Set(products.map((p) => p.brand).filter(Boolean));
  return Array.from(brands).sort();
}
