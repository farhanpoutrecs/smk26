import { Link } from "react-router-dom";
import { Calendar, Medal, MapTrifold, Image, Phone, Info, ShieldCheck, Handshake } from "@phosphor-icons/react";

const ITEMS = [
  { to: "/about", label: "Tentang SMK26", icon: Info, testid: "more-about" },
  { to: "/schedule", label: "Jadual 3 Hari", icon: Calendar, testid: "more-schedule" },
  { to: "/results", label: "Keputusan", icon: Medal, testid: "more-results" },
  { to: "/treasure-hunt", label: "Treasure Hunt", icon: MapTrifold, testid: "more-th" },
  { to: "/gallery", label: "Galeri", icon: Image, testid: "more-gallery" },
  { to: "/contact", label: "Hubungi", icon: Phone, testid: "more-contact" },
  { to: "/registration", label: "Daftar", icon: Handshake, testid: "more-registration" },
  { to: "/admin", label: "Admin Dashboard", icon: ShieldCheck, testid: "more-admin" },
];

export default function More() {
  return (
    <div className="px-4 py-8 max-w-3xl mx-auto" data-testid="more-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-2">Lainnya</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Semua Modul</h1>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {ITEMS.map(it => (
          <Link key={it.to} to={it.to} data-testid={it.testid} className="flex items-center gap-3 bg-[#12141A] border border-[#2D3342] rounded-md p-4 hover:border-[#00D4AA] transition-colors">
            <div className="w-11 h-11 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center">
              <it.icon size={20} weight="bold" />
            </div>
            <div className="font-display font-bold uppercase tracking-wide text-sm">{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
