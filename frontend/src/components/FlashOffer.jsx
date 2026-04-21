import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lightning, Clock } from "@phosphor-icons/react";

// Flash offer ends at Day 3 of event (7 Jun 2026 18:00 MY time by default).
// Main agent can override via props for live demo.
const DEFAULT_ENDS = "2026-06-07T18:00";

function useCountdown(targetIso) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(targetIso + ":00+08:00").getTime();
  const diff = target - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function FlashOffer({ endsAt = DEFAULT_ENDS }) {
  const c = useCountdown(endsAt);
  if (!c) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const isLastDay = c.d === 0;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border p-4 md:p-5 ${isLastDay ? "border-[#F97316] bg-gradient-to-br from-[#F97316]/15 to-[#12141A]" : "border-[#FACC15]/40 bg-gradient-to-br from-[#FACC15]/8 to-[#12141A]"}`}
      data-testid="flash-offer"
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-[#F97316]/20 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-[#FACC15]/20 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.25em] ${isLastDay ? "bg-[#F97316] text-white animate-pulse" : "bg-[#FACC15] text-[#0A0A0A]"}`}>
            <Lightning size={11} weight="fill" /> {isLastDay ? "Last Day" : "Flash Offer"}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Terhad</span>
        </div>

        <h3 className="font-display font-black text-xl md:text-2xl uppercase leading-tight">
          Finisher Medal + Wrist Towel — <span className="text-[#F97316]">Bundle RM100</span>
        </h3>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Edisi eksklusif SMK26. Jimat RM35 berbanding harga biasa. Tawaran berakhir bila kejohanan tamat.
        </p>

        <div className="mt-3 flex items-center gap-2" data-testid="flash-timer">
          <Clock size={14} className="text-[#FACC15]" weight="bold" />
          <div className="flex gap-1">
            {[{ v: c.d, l: "H" }, { v: c.h, l: "J" }, { v: c.m, l: "M" }, { v: c.s, l: "S" }].map((x, i) => (
              <div key={i} className="min-w-[38px] text-center bg-[#0A0A0A] border border-[#2D3342] rounded px-1.5 py-1">
                <div className="font-display font-black text-sm text-white">{pad(x.v)}</div>
                <div className="text-[8px] uppercase tracking-widest text-[#94A3B8]">{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            to="/shop"
            data-testid="flash-offer-cta"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-4 py-2.5 rounded-md uppercase tracking-wider text-xs glow-secondary"
          >
            Beli Sekarang
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] hover:border-[#FACC15] text-white font-bold px-4 py-2.5 rounded-md uppercase tracking-wider text-xs"
          >
            Lihat Semua
          </Link>
        </div>
      </div>
    </div>
  );
}
