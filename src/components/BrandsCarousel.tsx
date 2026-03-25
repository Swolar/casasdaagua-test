"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const brands = [
  "AGRATTO", "ANGELGRES", "BOSCH", "BRASTEMP", "Celite",
  "CERAMFIX", "Consul", "CORTAG", "DECA", "ELIANE",
  "FISCHER", "LORENZETTI", "TIGRE", "TRAMONTINA", "VOTORANTIM", "SUVINIL",
];

export default function BrandsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="brands">
      <div className="brands__container">
        <h2 className="brands__title">As melhores marcas</h2>
        <div className="brands__carousel">
          <button
            onClick={() => scroll("left")}
            className="brands__scroll-btn brands__scroll-btn--left"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            ref={scrollRef}
            className="brands__track"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {brands.map((brand) => (
              <div
                key={brand}
                className="brands__card"
              >
                <span className="brands__name">
                  {brand}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="brands__scroll-btn brands__scroll-btn--right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
