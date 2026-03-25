"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight, ChevronDown, Minus, Plus, ShoppingCart, Truck,
  MessageCircle, Heart, Share2, Facebook, Star, CreditCard,
} from "lucide-react";
import ProductShelf from "@/components/ProductShelf";
import { getProductsByCategory, getProductBySlug, type ProductLite } from "@/lib/products";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { useCart } from "@/contexts/CartContext";

interface FullProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  categorySlug: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  price: number;
  priceFrom?: number;
  discount?: number;
  installments?: { count: number; value: number };
  sku: string;
  skuName: string;
  inStock: boolean;
  productReference?: string;
  measurementUnit?: string;
  link: string;
}

export default function ProductPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [related, setRelated] = useState<ProductLite[]>([]);
  const [alsoLiked, setAlsoLiked] = useState<ProductLite[]>([]);
  const [descOpen, setDescOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    getProductBySlug(slug).then((found) => {
      setProduct(found as FullProduct | null);
      if (found) {
        const catProducts = getProductsByCategory(found.categorySlug).filter((p: ProductLite) => p.id !== found.id && p.inStock);
        setRelated(catProducts.slice(0, 15));
        setAlsoLiked(catProducts.slice(15, 30));
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="pdp__loading">
        <div className="pdp__loading-text">Carregando produto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp__not-found">
        <div className="text-center">
          <h1 className="pdp__not-found-title">Produto não encontrado</h1>
          <Link href="/" className="pdp__not-found-link">Voltar para a Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pdp">
      {/* Breadcrumbs */}
      <div className="pdp__breadcrumb">
        <nav className="pdp__breadcrumb-nav">
          <Link href="/" className="pdp__breadcrumb-link">Início</Link>
          <ChevronRight size={12} />
          <Link href={`/categoria/${product.categorySlug}`} className="pdp__breadcrumb-link">{product.category}</Link>
          {product.subCategory && (
            <>
              <ChevronRight size={12} />
              <span className="pdp__breadcrumb-link">{product.subCategory}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="pdp__breadcrumb-current">{product.name}</span>
        </nav>
      </div>

      <div className="pdp__container">
        <div className="pdp__grid">
          {/* LEFT: Image Gallery */}
          <div>
            {/* Wishlist */}
            <div className="pdp__wishlist">
              <Heart size={16} className="text-[#0862AD]" />
              <span className="pdp__wishlist-text">Adicionar aos favoritos</span>
            </div>

            <div className="pdp__gallery">
              {/* Thumbnails (vertical) */}
              {product.images.length > 1 && (
                <div className="pdp__thumbs">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`pdp__thumb ${i === selectedImage ? "pdp__thumb--active" : ""}`}
                    >
                      <Image src={img} alt="" width={64} height={64} className="object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="pdp__main-image">
                {product.images[selectedImage] ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                ) : (
                  <div className="text-[#979899]">Sem imagem</div>
                )}

                {/* Arrows for image navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((p) => (p - 1 + product.images.length) % product.images.length)}
                      className="pdp__img-nav pdp__img-nav--left"
                    >
                      <ChevronDown size={20} className="rotate-90" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((p) => (p + 1) % product.images.length)}
                      className="pdp__img-nav pdp__img-nav--right"
                    >
                      <ChevronDown size={20} className="-rotate-90" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            {/* Brand */}
            <p className="pdp__brand">
              Marca: <span className="pdp__brand-name">{product.brand}</span>
            </p>

            {/* Name */}
            <h1 className="pdp__name">{product.name}</h1>

            {/* Ref */}
            <p className="pdp__ref">REF: {product.productReference || product.sku}</p>

            {/* Quantity selector */}
            <div className="pdp__qty-row">
              <span className="pdp__qty-label">Quantidade:</span>
              <div className="pdp__qty-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="pdp__qty-btn">
                  <Minus size={14} />
                </button>
                <span className="pdp__qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="pdp__qty-btn">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="pdp__pricing">
              {product.priceFrom && (
                <p className="pdp__price-from">R$ {product.priceFrom.toFixed(2).replace(".", ",")}</p>
              )}
              <div className="pdp__price-row">
                <span className="pdp__price">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                  {product.measurementUnit ? `/${product.measurementUnit.toLowerCase()}` : ""}
                </span>
                {product.discount && product.discount > 0 && (
                  <span className="pdp__discount-badge">-{product.discount}%</span>
                )}
              </div>
              <p className="pdp__installments">
                {product.installments && product.installments.count > 1
                  ? `em até ${product.installments.count}x de R$ ${product.installments.value.toFixed(2).replace(".", ",")}`
                  : `em até 1x de R$ ${product.price.toFixed(2).replace(".", ",")}`}
              </p>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => {
                if (product) {
                  addItem({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    categorySlug: product.categorySlug,
                    images: product.images,
                    price: product.price,
                    priceFrom: product.priceFrom,
                    discount: product.discount,
                    installments: product.installments,
                    inStock: product.inStock,
                  }, quantity);
                }
              }}
              className="pdp__add-btn"
            >
              <ShoppingCart size={18} />
              Adicionar ao carrinho
            </button>

            <p className="pdp__discount-note">
              *Valor com desconto restrito ao parcelamento máximo acima especificado.
            </p>

            {/* CEP / Shipping */}
            <div className="pdp__shipping">
              <p className="pdp__shipping-title">Confira o prazo de entrega:</p>
              <div className="pdp__shipping-row">
                <input
                  type="text"
                  placeholder="Digite seu CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="pdp__shipping-input"
                />
                <button className="pdp__shipping-btn">Calcular</button>
              </div>
              <a href="#" className="pdp__shipping-link">Não sei meu CEP</a>
            </div>

            {/* Share */}
            <div className="pdp__share">
              <Share2 size={16} className="text-[#002A47]" />
              <span className="pdp__share-text">Compartilhe este produto:</span>
              <a href="#" className="pdp__share-btn pdp__share-btn--fb">
                <Facebook size={14} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' - ' + (product.link || ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdp__share-btn pdp__share-btn--wa"
              >
                <MessageCircle size={14} />
              </a>
            </div>

            {/* Action links */}
            <div className="pdp__actions">
              <button className="pdp__action-btn pdp__action-divider">
                <CreditCard size={14} />
                Consulte formas de pagamento
              </button>
              <a
                href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(`Olá! Gostaria de saber mais sobre: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdp__action-btn"
              >
                <MessageCircle size={14} />
                Consulte um especialista ou compre pelo Whatsapp
              </a>
            </div>
          </div>
        </div>

        {/* Description Accordion */}
        <div className="pdp__accordion">
          <button onClick={() => setDescOpen(!descOpen)} className="pdp__accordion-btn">
            Descrição
            <ChevronDown size={20} className={`transition-transform ${descOpen ? "rotate-180" : ""}`} />
          </button>
          {descOpen && (
            <div className="pdp__accordion-body">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-[#979899]">Descrição não disponível para este produto.</p>
              )}
            </div>
          )}
        </div>

        {/* Specifications Accordion */}
        <div className="pdp__accordion">
          <button onClick={() => setSpecsOpen(!specsOpen)} className="pdp__accordion-btn">
            Especificações
            <ChevronDown size={20} className={`transition-transform ${specsOpen ? "rotate-180" : ""}`} />
          </button>
          {specsOpen && (
            <div className="pdp__accordion-body">
              {Object.entries(product.specifications).length > 0 ? (
                <table className="pdp__specs-table">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? "pdp__specs-row--even" : ""}>
                        <td className="pdp__specs-cell pdp__specs-cell--key">{key}</td>
                        <td className="pdp__specs-cell pdp__specs-cell--value">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[#979899]">Especificações não disponíveis.</p>
              )}
            </div>
          )}
        </div>

        {/* Reviews section */}
        <div className="pdp__reviews">
          <h2 className="pdp__reviews-title">Avaliações</h2>
          <div className="pdp__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={18} className="text-[#E3EBED]" />
            ))}
          </div>
          <p className="pdp__rating">Classificação média: 0 (0 avaliações)</p>
          <a href="#" className="pdp__review-login">Faça login para escrever uma avaliação.</a>

          <div>
            <select className="pdp__review-sort">
              <option>Mais recentes</option>
              <option>Mais antigas</option>
              <option>Classificação mais alta</option>
              <option>Classificação mais baixa</option>
            </select>
          </div>
          <p className="pdp__no-reviews">Nenhuma avaliação</p>
        </div>

        {/* Related products */}
        {related.length > 0 && <ProductShelf title="Você também pode gostar:" products={related} />}
        {alsoLiked.length > 0 && <ProductShelf title="Quem comprou, também levou:" products={alsoLiked} />}
      </div>
    </div>
  );
}
