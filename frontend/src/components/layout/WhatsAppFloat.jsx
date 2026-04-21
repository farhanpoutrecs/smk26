import { WhatsappLogo } from "@phosphor-icons/react";
import { EVENT_INFO } from "../../data/sports";

export const WhatsAppFloat = () => (
  <a
    href={`https://wa.me/${EVENT_INFO.whatsapp}?text=Saya%20ingin%20bertanya%20tentang%20SMK26`}
    target="_blank"
    rel="noreferrer"
    data-testid="floating-whatsapp-btn"
    className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#F97316] hover:bg-[#EA580C] flex items-center justify-center glow-secondary transition-transform hover:scale-110"
    aria-label="Hubungi WhatsApp"
  >
    <WhatsappLogo size={28} weight="fill" className="text-white" />
  </a>
);

export default WhatsAppFloat;
