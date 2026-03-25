"use client";

import { WHATSAPP_NUMBER } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=Ol%C3%A1!%20Gostaria%20de%20atendimento.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      title="Fale conosco pelo WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
