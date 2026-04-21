import { Link } from "react-router-dom";
import * as Phosphor from "@phosphor-icons/react";
import { SPORTS, CATEGORY_LABEL } from "../data/sports";

export default function Sports() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto" data-testid="sports-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-2">15 Cabang</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">
        Senarai <span className="text-[#00D4AA]">Sukan</span>
      </h1>
      <p className="mt-3 text-[#94A3B8] text-sm md:text-base max-w-2xl">
        Pilih sukan untuk lihat format pertandingan, jadual, live scoreboard dan keputusan.
      </p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {SPORTS.map((s, idx) => {
          const Icon = Phosphor[s.icon] || Phosphor.Trophy;
          return (
            <Link
              key={s.id}
              to={`/sports/${s.id}`}
              data-testid={`sport-card-${s.id}`}
              className="group relative bg-[#12141A] border border-[#2D3342] rounded-md p-4 hover:border-[#00D4AA] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center">
                  <Icon size={22} weight="bold" />
                </div>
                <span className="text-[10px] font-mono text-[#94A3B8]">#{String(idx + 1).padStart(2, "0")}</span>
              </div>
              <div className="font-display font-bold uppercase tracking-wide text-base md:text-lg leading-tight">{s.name}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#94A3B8]">{s.day}</div>
              <div className="mt-0.5 text-xs text-[#94A3B8] truncate">{s.venue}</div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                  {CATEGORY_LABEL[s.category] || s.category}
                </span>
                <span className="text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 truncate max-w-full">
                  {s.format_label.split("(")[0].trim()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
