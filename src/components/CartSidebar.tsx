"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalItems, subtotal, discount, total } = useCart();

  if (!isOpen) return null;

  const freteGratisMin = 299;
  const freteProgress = Math.min((subtotal / freteGratisMin) * 100, 100);
  const faltaFrete = Math.max(freteGratisMin - subtotal, 0);

  return (
    <>
      {/* Overlay */}
      <div className="cart-overlay" onClick={closeCart} />

      {/* Sidebar */}
      <div className="cart-sidebar animate-cart-slide-in">
        {/* Header */}
        <div className="cart-sidebar__header">
          <div className="cart-sidebar__title-wrap">
            <ShoppingCart size={22} className="cart-sidebar__icon" />
            <h2 className="cart-sidebar__title">Meu carrinho</h2>
            <span className="cart-sidebar__count">({totalItems} {totalItems === 1 ? "item" : "itens"})</span>
          </div>
          <button onClick={closeCart} className="cart-sidebar__close">
            <X size={24} />
          </button>
        </div>

        {/* Frete grátis bar */}
        <div className="cart-sidebar__frete-bar">
          {faltaFrete > 0 ? (
            <p className="cart-sidebar__frete-text">
              Falta <strong className="cart-sidebar__frete-amount">R$ {faltaFrete.toFixed(2).replace(".", ",")}</strong> para ganhar <strong className="cart-sidebar__frete-free">frete grátis!</strong>
            </p>
          ) : (
            <p className="cart-sidebar__frete-success">
              Parabéns! Você ganhou frete grátis!
            </p>
          )}
          <div className="cart-sidebar__progress-track">
            <div
              className="cart-sidebar__progress-fill"
              style={{
                width: `${freteProgress}%`,
                background: freteProgress >= 100 ? "#00875A" : "#0862AD",
              }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="cart-sidebar__items">
          {items.length === 0 ? (
            <div className="cart-sidebar__empty">
              <ShoppingCart size={56} className="cart-sidebar__empty-icon" />
              <p className="cart-sidebar__empty-text">Seu carrinho está vazio</p>
              <button onClick={closeCart} className="cart-sidebar__empty-link">
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="cart-sidebar__list">
              {items.map((item) => (
                <div key={item.product.id} className="cart-sidebar__item">
                  <Link href={`/produto/${item.product.slug}`} onClick={closeCart} className="flex-shrink-0">
                    <div className="cart-sidebar__item-img">
                      {item.product.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                        />
                      ) : (
                        <div className="cart-sidebar__item-noimg">Sem img</div>
                      )}
                    </div>
                  </Link>

                  <div className="cart-sidebar__item-info">
                    <Link href={`/produto/${item.product.slug}`} onClick={closeCart}>
                      <p className="cart-sidebar__item-name">{item.product.name}</p>
                    </Link>

                    {item.product.priceFrom && item.product.priceFrom > item.product.price && (
                      <p className="cart-sidebar__item-old-price">
                        R$ {item.product.priceFrom.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                    <p className="cart-sidebar__item-price">
                      R$ {item.product.price.toFixed(2).replace(".", ",")}
                    </p>

                    <div className="cart-sidebar__item-controls">
                      <div className="cart-sidebar__qty">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="cart-sidebar__qty-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-sidebar__qty-value">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="cart-sidebar__qty-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="cart-sidebar__remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__totals">
              <div className="cart-sidebar__total-row">
                <span>Subtotal</span>
                <span className="cart-sidebar__total-value">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>
              {discount > 0 && (
                <div className="cart-sidebar__discount-row">
                  <span>Descontos</span>
                  <span className="cart-sidebar__discount-value">-R$ {discount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="cart-sidebar__grand-row">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart} className="cart-sidebar__checkout-btn">
              Finalizar compra
            </Link>
            <button onClick={closeCart} className="cart-sidebar__continue-btn">
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
