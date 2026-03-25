"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { ProductLite } from "@/lib/products";
import Link from "next/link";

interface ProductShelfProps {
  title: string;
  products: ProductLite[];
  viewMoreLink?: string;
}

export default function ProductShelf({ title, products, viewMoreLink }: ProductShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.querySelector("div")?.offsetWidth || 260;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth * 2) : cardWidth * 2,
        behavior: "smooth",
      });
    }
  };

  if (!products.length) return null;

  return (
    <section className="shelf">
      <div className="shelf__container">
        <div className="shelf__header">
          <h2 className="shelf__title">{title}</h2>
          {viewMoreLink && (
            <Link href={viewMoreLink} className="shelf__view-more">
              Ver mais
            </Link>
          )}
        </div>

        <div className="shelf__carousel">
          <button
            onClick={() => scroll("left")}
            className="shelf__scroll-btn shelf__scroll-btn--left"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="shelf__track"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div key={product.id} className="shelf__card-wrap">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="shelf__scroll-btn shelf__scroll-btn--right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
