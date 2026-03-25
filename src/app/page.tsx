import Image from "next/image";
import Link from "next/link";
import HeroBanner from "@/components/HeroBanner";
import Benefits from "@/components/Benefits";
import CategoryGrid from "@/components/CategoryGrid";
import ProductShelf from "@/components/ProductShelf";
import WhatYouLookFor from "@/components/WhatYouLookFor";
import InstitutionalSection from "@/components/InstitutionalSection";
import BrandsCarousel from "@/components/BrandsCarousel";
import homeShelves from "@/data/home-shelves.json";
import type { ProductLite } from "@/lib/products";

// Aplica 60% de desconto em todos os produtos da home
function applyDiscount(products: ProductLite[]): ProductLite[] {
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

export default function Home() {
  const bestSellers = applyDiscount(homeShelves.bestSellers as ProductLite[]);
  const onSale = applyDiscount(homeShelves.onSale as ProductLite[]);
  const recent = applyDiscount(homeShelves.recent as ProductLite[]);

  return (
    <>
      <HeroBanner />
      <Benefits />

      <div className="home__separator" />
      <ProductShelf title="Produtos mais vendidos" products={bestSellers} viewMoreLink="/busca?q=mais+vendidos" />

      <div className="home__separator" />
      <CategoryGrid />

      <div className="home__separator" />
      <WhatYouLookFor />

      <div className="home__separator" />
      <section className="home__special-section">
        <div className="home__special-container">
          <div className="home__special-header">
            <h2 className="home__special-title">Seleção especial</h2>
            <Link href="/categoria/eletrodomesticos" className="home__special-link">Ver mais</Link>
          </div>
          <Link href="/categoria/eletrodomesticos" className="home__special-banner">
            <Image
              src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/4815deda-da35-45ed-ae2f-0159205f2342___cebd0dfe919b179b3e19dac5f7c3b10c.jpg"
              alt="Seleção especial - Eletro em até 10x no cartão"
              width={1292}
              height={200}
              className="home__special-img"
            />
          </Link>
        </div>
      </section>

      <div className="home__separator" />
      {onSale.length > 0 && (
        <ProductShelf title="Ofertas Imperdíveis" products={onSale} />
      )}

      <div className="home__separator" />
      <ProductShelf title="Novidades" products={recent} />

      <div className="home__separator" />
      <BrandsCarousel />

      <div className="home__separator" />
      <InstitutionalSection />
    </>
  );
}
