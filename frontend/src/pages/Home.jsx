import { Link } from "react-router-dom";
import { ArrowRight, Fire, Calendar, MapPin, Users, Medal, MapTrifold, Storefront } from "@phosphor-icons/react";
import { SPORTS, EVENT_INFO } from "../data/sports";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/cc4ea78b-0e96-4cb1-8140-80a8127210a4/images/3ad57717315ce5ecb14a46b370093b6d5a2a2f854676df31d08a953a1074b26a.png";

export default function Home() {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#2D3342]">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/40 to-[#0A0A0A]" />
          <div className="absolute inset-0 mesh-grid opacity-40" />
        </div>

        <div className="relative px-4 pt-10 pb-16 md:pt-20 md:pb-24 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/30 text-[#00D4AA] text-xs font-bold uppercase tracking-[0.2em] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] pulse-dot" />
            Daftar Kini Dibuka
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.9] max-w-4xl">
            Kejohanan Sukan<br />
            <span className="text-[#00D4AA]">Kementerian</span>,<br />
            Jabatan & Agensi<br />
            <span className="text-[#F97316]">KPKM 2026</span>
          </h1>

          <p className="mt-5 text-base md:text-lg text-[#94A3B8] max-w-xl">
            3 hari. 15 sukan. 2,000 peserta. Satu platform rasmi. <span className="text-white font-semibold">{EVENT_INFO.motto}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/registration"
              data-testid="hero-daftar-btn"
              className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-5 py-3 rounded-md hover:bg-[#22C55E] transition-colors glow-primary uppercase tracking-wider text-sm"
            >
              Daftar Sekarang <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              to="/schedule"
              data-testid="hero-jadual-btn"
              className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] text-white font-bold px-5 py-3 rounded-md hover:border-[#00D4AA] transition-colors uppercase tracking-wider text-sm"
            >
              Lihat Jadual
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: Calendar, label: "Tarikh", value: EVENT_INFO.dates },
              { icon: MapPin, label: "Lokasi", value: "MAEPS, Serdang" },
              { icon: Users, label: "Peserta", value: "2,000+" },
              { icon: Medal, label: "Sukan", value: "15 Cabang" },
            ].map((it, i) => (
              <div key={i} className="bg-[#12141A]/80 backdrop-blur-sm border border-[#2D3342] rounded-md p-3 md:p-4">
                <div className="flex items-center gap-2 text-[#00D4AA] mb-1">
                  <it.icon size={18} weight="bold" />
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{it.label}</div>
                </div>
                <div className="font-display font-bold text-base md:text-lg text-white">{it.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="px-4 py-10 max-w-6xl mx-auto">
        <div className="text-xs font-bold tracking-[0.25em] uppercase text-[#F97316] mb-2">Modul Pantas</div>
        <h2 className="font-display font-black text-3xl md:text-4xl uppercase mb-6">Apa anda mahu lakukan?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { to: "/registration", label: "Daftar Peserta", icon: Users, color: "#00D4AA", testid: "quick-register" },
            { to: "/scoreboard", label: "Skor Langsung", icon: Fire, color: "#F97316", testid: "quick-scoreboard" },
            { to: "/treasure-hunt", label: "Treasure Hunt", icon: MapTrifold, color: "#22C55E", testid: "quick-th" },
            { to: "/shop", label: "eShop Merch", icon: Storefront, color: "#FACC15", testid: "quick-shop" },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              data-testid={c.testid}
              className="group relative overflow-hidden bg-[#12141A] border border-[#2D3342] rounded-md p-4 md:p-5 hover:border-[#00D4AA] transition-colors"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-md mb-3" style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon size={24} weight="bold" />
              </div>
              <div className="font-display font-bold uppercase tracking-wide text-sm md:text-base">{c.label}</div>
              <ArrowRight size={16} className="absolute top-4 right-4 text-[#94A3B8] group-hover:text-[#00D4AA] transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* SPORTS MARQUEE */}
      <section className="border-y border-[#2D3342] bg-[#12141A] overflow-hidden">
        <div className="marquee-track flex gap-10 py-5 whitespace-nowrap">
          {[...SPORTS, ...SPORTS].map((s, i) => (
            <span key={i} className="font-display font-black text-2xl md:text-3xl uppercase text-[#94A3B8] tracking-wider">
              <span className="text-[#00D4AA] mr-3">●</span>{s.name}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="px-4 py-10 max-w-6xl mx-auto">
        <div className="relative rounded-lg border border-[#2D3342] bg-[#12141A] p-6 md:p-10 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#F97316]/20 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[#00D4AA]/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-[0.25em] text-[#F97316] mb-2">Dianjurkan Oleh</div>
            <div className="font-display text-xl md:text-2xl font-bold uppercase">{EVENT_INFO.organizer}</div>
            <div className="text-[#94A3B8] text-sm mt-1">Operator: {EVENT_INFO.operator}</div>
            <Link
              to="/about"
              data-testid="home-about-cta"
              className="mt-5 inline-flex items-center gap-2 text-[#00D4AA] font-bold uppercase tracking-wider text-sm"
            >
              Selengkapnya tentang kejohanan <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
