"use client";

import { X, Rocket } from "lucide-react";

interface CardRejectionModalProps {
  onSwitchToPix: () => void;
  onClose: () => void;
}

export default function CardRejectionModal({ onSwitchToPix, onClose }: CardRejectionModalProps) {
  return (
    <div className="modal-rejection__overlay" onClick={onClose}>
      <div className="modal-rejection__card" onClick={(e) => e.stopPropagation()}>
        {/* X icon circle */}
        <div className="modal-rejection__icon">
          <X size={32} strokeWidth={3} />
        </div>

        <h2 className="modal-rejection__title">
          Pagamento Recusado!
        </h2>
        <p className="modal-rejection__text">
          A operadora do cartão não autorizou a transação.
        </p>
        <p className="modal-rejection__highlight">
          Mas não perca essa oportunidade!
        </p>

        {/* Oferta box */}
        <div className="modal-rejection__offer">
          <p className="modal-rejection__offer-label">OFERTA EXCLUSIVA</p>
          <p className="modal-rejection__offer-text">
            Finalize no PIX agora e ganhe:
          </p>
          <p className="modal-rejection__offer-value">
            5% DE DESCONTO + ENVIO PRIORITÁRIO <Rocket size={16} className="inline" />
          </p>
        </div>

        <button onClick={onSwitchToPix} className="modal-rejection__btn-pix">
          PAGAR COM PIX AGORA
        </button>
        <button onClick={onClose} className="modal-rejection__btn-back">
          Tentar cartão novamente
        </button>
      </div>
    </div>
  );
}
