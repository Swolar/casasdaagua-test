"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const banners = [
  {
    id: "1",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/ef35b228-ae33-4238-ac15-324b15318418___76626ab315d55f91eaf466400bdaee97.png",
    alt: "Toda a linha de ar-condicionados Agratto",
    link: "/categoria/climatizacao-e-ventilacao",
  },
  {
    id: "2",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/cf56ae9e-dbbc-4362-af7f-9180bcaeed85___5960f4ec11a1d44e49a892e9b479607e.gif",
    alt: "Promoção Casas da Água",
    link: "/categoria/eletrodomesticos",
    isGif: true,
  },
  {
    id: "3",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/7d12f6d0-7968-4fb9-af57-ea7ef88f68e8___a83029baca940e14e80c762e3e07d26b.gif",
    alt: "Ofertas especiais",
    link: "/categoria/materiais-para-construcao",
    isGif: true,
  },
  {
    id: "4",
    image: "https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/892d31fd-85fd-4d7a-ae4c-1e32dcfde59c___ac60dfa14466c0acff6515bfef803ff5.png",
    alt: "Pisos e Revestimentos",
    link: "/categoria/pisos-e-revestimentos",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((p) => (p + 1) % banners.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + banners.length) % banners.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="hero">
      <div className="hero__container">
        <div className="hero__slider">
          <div
            className="hero__track"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link}
                className="hero__slide"
              >
                <div className="hero__slide-inner" style={{ aspectRatio: "1292/400" }}>
                  {banner.isGif ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="hero__slide-img"
                    />
                  ) : (
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                      priority={banner.id === "1"}
                      sizes="(max-width: 1292px) 100vw, 1292px"
                    />
                  )}
                </div>
              </a>
            ))}
          </div>

          <button
            onClick={prev}
            className="hero__nav-btn hero__nav-btn--left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="hero__nav-btn hero__nav-btn--right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="hero__dots">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`hero__dot ${
              i === current ? "hero__dot--active" : "hero__dot--inactive"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
