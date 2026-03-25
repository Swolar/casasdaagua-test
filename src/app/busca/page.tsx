"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/lib/products";
import { SORT_OPTIONS } from "@/lib/constants";
import { ChevronRight, Search } from "lucide-react";

const RESULTS_PER_PAGE = 40;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState("relevance");
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);

  const results = useMemo(() => {
    let products = searchProducts(query);
    switch (sortBy) {
      case "price-asc": products.sort((a, b) => a.price - b.price); break;
      case "price-desc": products.sort((a, b) => b.price - a.price); break;
      case "name-asc": products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "discount": products.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
    }
    return products;
  }, [query, sortBy]);

  const visible = results.slice(0, visibleCount);

  return (
    <div className="search">
      <div className="search__breadcrumb">
        <nav className="search__breadcrumb-nav">
          <Link href="/" className="search__breadcrumb-link">Home</Link>
          <ChevronRight size={14} />
          <span className="search__breadcrumb-current">Busca</span>
        </nav>
      </div>

      <div className="search__container">
        <div className="search__header">
          <div>
            <h1 className="search__title">
              <Search size={24} /> Resultados para &ldquo;{query}&rdquo;
            </h1>
            <p className="search__count">{results.length} produtos encontrados</p>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="search__sort-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {visible.length > 0 ? (
          <>
            <div className="search__grid">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {visibleCount < results.length && (
              <div className="search__load-more">
                <button
                  onClick={() => setVisibleCount((v) => v + RESULTS_PER_PAGE)}
                  className="search__load-btn"
                >
                  Mostrar mais ({results.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="search__empty">
            <Search size={48} className="mx-auto text-[#E3EBED] mb-4" />
            <h2 className="search__empty-title">Nenhum resultado encontrado</h2>
            <p className="search__empty-text">Tente buscar com outros termos ou navegue pelas categorias.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="search__fallback" />}>
      <SearchContent />
    </Suspense>
  );
}
