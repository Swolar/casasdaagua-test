"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Instagram, Facebook, Linkedin, Youtube, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  VisaLogo, MastercardLogo, AmexLogo, EloLogo,
  HipercardLogo, DinersLogo, PaypalLogo, PixLogo, BoletoLogo
} from "./CardBrandLogos";

export default function Footer() {
  const [instOpen, setInstOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer__main">
        <div className="footer__grid">
          {/* Contact & Social */}
          <div className="footer__contact">
            <div className="footer__phone-label">
              <Phone size={18} className="text-[#002A47]" />
              <span className="footer__phone-text">Telefone ou WhatsApp</span>
            </div>
            <p className="footer__phone-number">{process.env.NEXT_PUBLIC_PHONE}</p>
            <p className="footer__hours">Horário de atendimento</p>
            <p className="footer__hours">de segunda à sexta-feira das 07:30 às 19:00</p>
            <p className="footer__hours footer__hours--last">e sábado das 07:30 às 13:00. Exceto feriados.</p>
            <div className="footer__socials">
              {[
                { icon: <Instagram size={18} />, href: "https://www.instagram.com/casasdaagua/" },
                { icon: <Facebook size={18} />, href: "https://www.facebook.com/casasdaagua" },
                { icon: <Linkedin size={18} />, href: "https://www.linkedin.com/company/casas-da-agua/" },
                { icon: <Youtube size={18} />, href: "https://www.youtube.com/casasdaagua" },
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="footer__social-btn">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Institucional */}
          <div>
            <button
              onClick={() => setInstOpen(!instOpen)}
              className="footer__accordion-btn"
            >
              Institucional
              <ChevronDown size={16} className={`md:hidden transition-transform ${instOpen ? "rotate-180" : ""}`} />
            </button>
            <ul className={`footer__accordion-list ${instOpen ? "block" : "hidden md:block"}`}>
              {["Sobre Nós", "Nossas Lojas", "Privacidade e Segurança", "Crediário", "Imprimir Boleto", "Trabalhe Conosco"].map((item) => (
                <li key={item}>
                  <Link href="#" className="footer__accordion-link">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Central de Ajuda */}
          <div>
            <button
              onClick={() => setHelpOpen(!helpOpen)}
              className="footer__accordion-btn"
            >
              Central de ajuda
              <ChevronDown size={16} className={`md:hidden transition-transform ${helpOpen ? "rotate-180" : ""}`} />
            </button>
            <ul className={`footer__accordion-list ${helpOpen ? "block" : "hidden md:block"}`}>
              {["Fale Conosco", "Política de Frete e Entrega", "Trocas e Devoluções", "Formas de Pagamento", "Política de Reembolso"].map((item) => (
                <li key={item}>
                  <Link href="#" className="footer__accordion-link">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="footer__newsletter-title">Assine nossa newsletter</h3>
            <p className="footer__newsletter-desc">Receba novidades e promoções exclusivas</p>
            <div className="footer__newsletter-fields">
              <input
                type="text"
                placeholder="Digite seu nome"
                className="footer__input"
              />
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className="footer__input"
              />
              <label className="footer__checkbox-label">
                <input type="checkbox" className="mt-0.5" />
                <span>Declaro estar ciente das <Link href="#" className="footer__privacy-link">Política de Privacidade</Link></span>
              </label>
              <button className="footer__submit-btn">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <div className="footer__bottom-row">
            <p className="footer__legal">
              {process.env.NEXT_PUBLIC_LEGAL} · CNPJ {process.env.NEXT_PUBLIC_CNPJ} {process.env.NEXT_PUBLIC_ADDRESS}
            </p>
            {/* Payment Methods */}
            <div className="footer__payments">
              {[
                { name: "Amex", logo: <AmexLogo width={36} height={24} /> },
                { name: "Master", logo: <MastercardLogo width={36} height={24} /> },
                { name: "Visa", logo: <VisaLogo width={36} height={24} /> },
                { name: "Hiper", logo: <HipercardLogo width={36} height={24} /> },
                { name: "Elo", logo: <EloLogo width={36} height={24} /> },
                { name: "Diners", logo: <DinersLogo width={36} height={24} /> },
                { name: "PayPal", logo: <PaypalLogo width={36} height={24} /> },
                { name: "PIX", logo: <PixLogo width={36} height={24} /> },
                { name: "Boleto", logo: <BoletoLogo width={36} height={24} /> },
              ].map((m) => (
                <span
                  key={m.name}
                  className="footer__payment-badge"
                  title={m.name}
                >
                  {m.logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
