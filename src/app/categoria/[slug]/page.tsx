"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, getBrandsByCategory } from "@/lib/products";
import categoriesSummary from "@/data/categories-summary.json";
import { SORT_OPTIONS } from "@/lib/constants";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";

const PRODUCTS_PER_PAGE = 40;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const allCategories = categoriesSummary;
  const currentCat = allCategories.find((c) => c.slug === slug);
  const categoryName = currentCat?.name || slug;

  const [sortBy, setSortBy] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  const brands = useMemo(() => getBrandsByCategory(slug), [slug]);

  const filteredProducts = useMemo(() => {
    let products = getProductsByCategory(slug).filter((p) => p.inStock);

    if (selectedBrands.length > 0) {
      products = products.filter((p) => selectedBrands.includes(p.brand));
    }
    if (priceMin) {
      products = products.filter((p) => p.price >= Number(priceMin));
    }
    if (priceMax) {
      products = products.filter((p) => p.price <= Number(priceMax));
    }

    switch (sortBy) {
      case "price-asc": products.sort((a, b) => a.price - b.price); break;
      case "price-desc": products.sort((a, b) => b.price - a.price); break;
      case "name-asc": products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": products.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "discount": products.sort((a, b) => (b.discount || 0) - (a.discount || 0)); break;
    }

    return products;
  }, [slug, sortBy, selectedBrands, priceMin, priceMax]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setVisibleCount(PRODUCTS_PER_PAGE);
  };

  return (
    <div className="catpage">
      {/* Breadcrumbs */}
      <div className="catpage__breadcrumb">
        <nav className="catpage__breadcrumb-nav">
          <Link href="/" className="catpage__breadcrumb-link">Home</Link>
          <ChevronRight size={14} />
          <span className="catpage__breadcrumb-current">{categoryName}</span>
        </nav>
      </div>

      <div className="catpage__container">
        {/* Header */}
        <div className="catpage__header">
          <div>
            <h1 className="catpage__title">{categoryName}</h1>
            <p className="catpage__count">
              {visibleProducts.length} de {filteredProducts.length} produtos
            </p>
          </div>
          <div className="catpage__controls">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="catpage__filter-btn"
            >
              <SlidersHorizontal size={16} /> Filtros
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="catpage__sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="catpage__layout">
          {/* Sidebar */}
          <aside className={`catpage__sidebar ${filtersOpen ? "catpage__sidebar--mobile-open" : ""}`}>
            <div className="catpage__sidebar-mobile-header">
              <h2 className="catpage__sidebar-mobile-title">Filtros</h2>
              <button onClick={() => setFiltersOpen(false)}><X size={24} /></button>
            </div>

            <div className="catpage__filters">
              {/* Categories */}
              <div>
                <h3 className="catpage__filter-title">Categorias</h3>
                <ul className="catpage__filter-list">
                  {allCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        className={`catpage__cat-link ${cat.slug === slug ? "catpage__cat-link--active" : ""}`}
                      >
                        {cat.name} <span className="catpage__cat-count">({cat.count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h3 className="catpage__filter-title">Marca</h3>
                  <ul className="catpage__filter-list catpage__filter-list--brands">
                    {brands.map((brand) => (
                      <li key={brand}>
                        <label className="catpage__brand-label">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="catpage__brand-checkbox"
                          />
                          <span className="catpage__brand-name">{brand}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price */}
              <div>
                <h3 className="catpage__filter-title">Faixa de Preço</h3>
                <div className="catpage__price-row">
                  <input type="number" placeholder="Min" value={priceMin} onChange={(e) => { setPriceMin(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }} className="catpage__price-input" />
                  <span className="catpage__price-separator">-</span>
                  <input type="number" placeholder="Max" value={priceMax} onChange={(e) => { setPriceMax(e.target.value); setVisibleCount(PRODUCTS_PER_PAGE); }} className="catpage__price-input" />
                </div>
              </div>

              {/* Clear */}
              {(selectedBrands.length > 0 || priceMin || priceMax) && (
                <button
                  onClick={() => { setSelectedBrands([]); setPriceMin(""); setPriceMax(""); }}
                  className="catpage__clear-btn"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="catpage__products">
            {visibleProducts.length > 0 ? (
              <div className="catpage__grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catpage__empty">
                <p className="catpage__empty-text">Nenhum produto encontrado.</p>
              </div>
            )}

            {visibleCount < filteredProducts.length && (
              <div className="catpage__load-more">
                <button
                  onClick={() => setVisibleCount((v) => v + PRODUCTS_PER_PAGE)}
                  className="catpage__load-btn"
                >
                  Mostrar mais ({filteredProducts.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
