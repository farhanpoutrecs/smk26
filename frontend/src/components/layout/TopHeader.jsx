import { Link, useLocation } from "react-router-dom";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { EVENT_INFO } from "../../data/sports";

const NAV = [
  { to: "/", label: "Utama" },
  { to: "/about", label: "Tentang" },
  { to: "/sports", label: "Sukan" },
  { to: "/schedule", label: "Jadual" },
  { to: "/registration", label: "Daftar" },
  { to: "/scoreboard", label: "Skor" },
  { to: "/results", label: "Keputusan" },
  { to: "/treasure-hunt", label: "Treasure Hunt" },
  { to: "/shop", label: "eShop" },
  { to: "/gallery", label: "Galeri" },
  { to: "/contact", label: "Hubungi" },
];

export const TopHeader = () => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0A]/85 border-b border-[#2D3342]"
      data-testid="top-header"
    >
      <div className="flex items-center justify-between px-4 h-14 md:h-16 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 group" data-testid="header-logo">
          <div className="w-9 h-9 rounded-md bg-[#00D4AA] flex items-center justify-center font-display font-black text-[#0A0A0A] text-lg group-hover:glow-primary transition-all">
            S
          </div>
          <div className="leading-tight">
            <div className="font-display font-black text-white text-lg tracking-tight">SMK<span className="text-[#F97316]">26</span></div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] hidden sm:block">{EVENT_INFO.dates}</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
          {NAV.slice(0,8).map(n => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.to.replace("/", "home").replace(/\//g, "-")}`}
              className={`px-3 py-2 text-sm font-semibold tracking-wide uppercase rounded-md transition-colors ${loc.pathname === n.to ? "text-[#00D4AA]" : "text-[#94A3B8] hover:text-white"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${EVENT_INFO.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-md bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors"
            data-testid="header-whatsapp-btn"
          >
            <WhatsappLogo size={16} weight="fill" /> WhatsApp
          </a>
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md bg-[#12141A] border border-[#2D3342] text-white"
            data-testid="mobile-menu-toggle"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#2D3342] bg-[#0A0A0A]" data-testid="mobile-menu">
          <div className="grid grid-cols-2 gap-1 p-3 max-h-[70vh] overflow-y-auto">
            {NAV.map(n => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                data-testid={`mobile-nav-${n.to.replace("/", "home").replace(/\//g, "-")}`}
                className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded-md border ${loc.pathname === n.to ? "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/40" : "bg-[#12141A] text-[#94A3B8] border-[#2D3342]"}`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="col-span-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide rounded-md border bg-[#12141A] text-[#F97316] border-[#F97316]/40"
              data-testid="mobile-nav-admin"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopHeader;
