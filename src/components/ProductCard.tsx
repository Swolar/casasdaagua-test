"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductLite } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: ProductLite;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0] || "";
  const { addItem } = useCart();

  return (
    <div className="pcard">
      {product.discount && product.discount > 0 && (
        <span className="pcard__badge">
          -{product.discount}%
        </span>
      )}

      <Link href={`/produto/${product.slug}`} className="pcard__img-link">
        <div className="pcard__img-area">
          <div className="pcard__img-inner">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 250px"
              />
            ) : (
              <div className="pcard__no-img">
                Sem imagem
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="pcard__body">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="pcard__name">
            {product.name}
          </h3>
        </Link>

        <div className="pcard__prices">
          {product.priceFrom && (
            <span className="pcard__price-from">
              R$ {product.priceFrom.toFixed(2).replace(".", ",")}
            </span>
          )}
          <span className="pcard__price">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <p className="pcard__installments">
            {product.installments && product.installments.count > 1
              ? `em até ${product.installments.count}x de R$ ${product.installments.value.toFixed(2).replace(".", ",")}`
              : `à vista`}
          </p>
        </div>
      </div>

      <div className="pcard__actions">
        {product.inStock ? (
          <button
            onClick={() => addItem(product)}
            className="pcard__add-btn"
          >
            Adicionar ao carrinho
          </button>
        ) : (
          <button
            className="pcard__notify-btn"
          >
            Avise-me
          </button>
        )}
      </div>
    </div>
  );
}
