import { WhatsappLogo, EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react";
import { EVENT_INFO } from "../data/sports";

export default function Contact() {
  return (
    <div className="px-4 py-8 max-w-3xl mx-auto" data-testid="contact-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#00D4AA] mb-2">Hubungi Kami</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Urus Setia SMK26</h1>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { icon: WhatsappLogo, label: "WhatsApp", value: EVENT_INFO.whatsapp, href: `https://wa.me/${EVENT_INFO.whatsapp}`, testid: "contact-whatsapp" },
          { icon: EnvelopeSimple, label: "Emel", value: "urusetia@poutrecs.com", href: "mailto:urusetia@poutrecs.com", testid: "contact-email" },
          { icon: MapPin, label: "Tempat", value: EVENT_INFO.venue, testid: "contact-venue" },
          { icon: Phone, label: "Talian Urus Setia", value: "+603-8889 0000", testid: "contact-phone" },
        ].map((it, i) => (
          <a key={i} href={it.href || "#"} target={it.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" data-testid={it.testid} className="flex items-center gap-3 bg-[#12141A] border border-[#2D3342] rounded-md p-4 hover:border-[#00D4AA] transition-colors">
            <div className="w-11 h-11 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center">
              <it.icon size={22} weight="bold" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{it.label}</div>
              <div className="font-semibold">{it.value}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
