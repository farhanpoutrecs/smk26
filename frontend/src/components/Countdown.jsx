import { useEffect, useState } from "react";
import { computeCountdown } from "../lib/schedule-utils";

export default function Countdown({ target, compact = false, label = "Bermula dalam" }) {
  const [c, setC] = useState(() => computeCountdown(target));
  useEffect(() => {
    const t = setInterval(() => setC(computeCountdown(target)), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (!c || c.expired) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const cells = [
    { v: c.days, l: "H" },
    { v: c.hours, l: "J" },
    { v: c.mins, l: "M" },
    { v: c.secs, l: "S" },
  ];

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#FACC15]" data-testid="countdown-compact">
        <span>{c.days > 0 ? `${c.days}H ` : ""}{pad(c.hours)}:{pad(c.mins)}:{pad(c.secs)}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#FACC15]/30 rounded-md p-3" data-testid="countdown-full">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#FACC15] mb-2 font-bold">{label}</div>
      <div className="flex gap-2">
        {cells.map((x, i) => (
          <div key={i} className="flex-1 text-center bg-[#12141A] border border-[#2D3342] rounded-md py-2">
            <div className="font-display font-black text-2xl md:text-3xl text-white">{pad(x.v)}</div>
            <div className="text-[9px] uppercase tracking-widest text-[#94A3B8]">{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
