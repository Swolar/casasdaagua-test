"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingCart, MapPin, Menu, X, ChevronDown, Headphones } from "lucide-react";
import Image from "next/image";
import TopBar from "./TopBar";
import categoriesSummary from "@/data/categories-summary.json";
import { useCart } from "@/contexts/CartContext";

const CATEGORIES = categoriesSummary;

const NAV_ITEMS = [
  { label: "Materiais para construção", slug: "materiais-para-construcao", hasDropdown: true },
  { label: "Pisos e Revestimentos", slug: "pisos-e-revestimentos", hasDropdown: true },
  { label: "Crediário", slug: "#", hasDropdown: false },
  { label: "Imprimir Boleto", slug: "#", hasDropdown: false },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="header">
      <TopBar />

      {/* Main Header - Desktop */}
      <div className="header__main">
        <div className="header__container">
          {/* Desktop layout */}
          <div className="header__desktop">
            <Link href="/" className="header__logo-desktop">
              <Image
                src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
                alt="Casas da Água"
                width={180}
                height={56}
                className="object-contain"
                priority
              />
            </Link>

            <form onSubmit={handleSearch} className="header__search-form">
              <div className="header__search-box">
                <input
                  type="text"
                  placeholder="Digite a sua busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="header__search-input"
                />
                <button
                  type="submit"
                  className="header__search-btn"
                >
                  <Search size={16} />
                  Buscar
                </button>
              </div>
            </form>

            <div className="header__icon-link">
              <MapPin size={20} className="text-[#0862AD]" />
              <div className="header__icon-text">
                <p>Informe</p>
                <p>seu CEP</p>
              </div>
            </div>

            <Link href="#" className="header__icon-link">
              <Headphones size={22} className="text-[#0862AD]" />
              <div className="header__icon-text">
                <p>Fale com um</p>
                <p>especialista</p>
              </div>
            </Link>

            <Link href="#" className="header__icon-link">
              <User size={22} />
              <div className="header__user-text">
                <p>Entre ou</p>
                <p>cadastre-se</p>
              </div>
            </Link>

            <button onClick={openCart} className="header__cart-btn">
              <ShoppingCart size={24} />
              <span className="header__cart-badge" style={{ width: 18, height: 18 }}>
                {totalItems}
              </span>
            </button>
          </div>

          {/* Mobile layout */}
          <div className="header__mobile">
            {/* Row 1: Menu + Logo + Cart */}
            <div className="header__mobile-row">
              <button className="header__menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>

              <Link href="/" className="header__logo-mobile">
                <Image
                  src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
                  alt="Casas da Água"
                  width={150}
                  height={48}
                  className="object-contain"
                  priority
                />
              </Link>

              <button onClick={openCart} className="header__cart-mobile">
                <ShoppingCart size={22} />
                <span className="header__cart-badge-mobile" style={{ width: 16, height: 16 }}>
                  {totalItems}
                </span>
              </button>
            </div>

            {/* Row 2: Search bar */}
            <form onSubmit={handleSearch} className="header__mobile-search">
              <div className="header__search-box">
                <input
                  type="text"
                  placeholder="Digite a sua busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="header__search-input"
                />
                <button
                  type="submit"
                  className="header__search-btn"
                >
                  <Search size={16} />
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="header__nav">
        <div className="header__nav-inner">
          <div className="header__nav-left">
            <div
              className="relative"
              onMouseEnter={() => setDeptOpen(true)}
              onMouseLeave={() => setDeptOpen(false)}
            >
              <button className="header__dept-btn">
                <Menu size={18} />
                Todos os departamentos
                <ChevronDown size={14} />
              </button>
              {deptOpen && (
                <div className="header__dept-dropdown">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/categoria/${cat.slug}`}
                      className="header__dept-link"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="header__nav-divider"></div>

            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.slug.startsWith("#") ? "#" : `/categoria/${item.slug}`}
                className="header__nav-link"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown size={13} />}
              </Link>
            ))}
          </div>

          <Link href="#" className="header__btu-link">
            Calculadora de BTU&apos;s
          </Link>
        </div>
      </nav>

      {/* Mobile: CEP bar */}
      <div className="header__cep-bar">
        <div className="header__cep-inner">
          <MapPin size={18} className="text-[#0862AD]" />
          <span className="header__cep-text">Informe seu CEP</span>
          <ChevronDown size={14} className="ml-auto text-[#979899]" />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <>
          <div className="header__overlay" onClick={() => setMenuOpen(false)} />
          <div className="header__slide-menu">
            {/* Menu Header */}
            <div className="header__menu-header">
              <div className="header__menu-welcome">
                <User size={24} className="text-white" />
                <div>
                  <p className="header__menu-title">Olá, bem-vindo!</p>
                  <p className="header__menu-subtitle">Entre ou cadastre-se</p>
                </div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="header__menu-close">
                <X size={24} />
              </button>
            </div>

            {/* Departamentos */}
            <div className="header__menu-section-title">
              <h3>Departamentos</h3>
            </div>
            <div className="px-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categoria/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="header__menu-cat-link"
                >
                  <ChevronDown size={13} className="text-[#0862AD] -rotate-90" />
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Separator */}
            <div className="header__menu-separator" />

            {/* Links extras */}
            <div className="px-2 pb-6">
              <Link href="#" onClick={() => setMenuOpen(false)} className="header__menu-extra-link">
                <span className="w-5 h-5 flex items-center justify-center text-[#0862AD]">💳</span>
                Crediário
              </Link>
              <Link href="#" onClick={() => setMenuOpen(false)} className="header__menu-extra-link">
                <span className="w-5 h-5 flex items-center justify-center text-[#0862AD]">🧾</span>
                Imprimir Boleto
              </Link>
              <Link href="#" onClick={() => setMenuOpen(false)} className="header__menu-extra-link header__menu-extra-link--highlight">
                <span className="w-5 h-5 flex items-center justify-center">❄️</span>
                Calculadora de BTU&apos;s
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
