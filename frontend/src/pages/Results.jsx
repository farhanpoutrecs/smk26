import { RESULTS_SAMPLE, SPORTS } from "../data/sports";
import { Medal, Trophy } from "@phosphor-icons/react";

const PODIUM = "https://images.pexels.com/photos/7267573/pexels-photo-7267573.jpeg";

export default function Results() {
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto" data-testid="results-page">
      <div className="relative rounded-lg border border-[#2D3342] overflow-hidden mb-8">
        <img src={PODIUM} alt="" className="w-full h-48 md:h-64 object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
        <div className="absolute bottom-0 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#FACC15] mb-1">Johan · Naib Johan · Ketiga</div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Keputusan Rasmi</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RESULTS_SAMPLE.map((r) => {
          const sport = SPORTS.find(s => s.id === r.sport_id);
          return (
            <div key={r.sport_id} className="bg-[#12141A] border border-[#2D3342] rounded-md p-5" data-testid={`result-${r.sport_id}`}>
              <div className="flex items-center gap-2 text-[#F97316] mb-3">
                <Trophy size={20} weight="fill" />
                <div className="font-display font-bold uppercase tracking-wider">{r.title}</div>
              </div>
              <div className="space-y-2">
                {r.podium.map((p) => (
                  <div key={p.rank} className="flex items-center gap-3 bg-[#0A0A0A] border border-[#2D3342] rounded-md p-3">
                    <Medal size={22} weight="fill" className={p.rank === 1 ? "text-[#FACC15]" : p.rank === 2 ? "text-[#94A3B8]" : "text-[#F97316]"} />
                    <div className="flex-1">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Tempat {p.rank}</div>
                      <div className="font-semibold">{p.name}</div>
                    </div>
                    <div className="text-xs text-[#94A3B8]">{p.agency}</div>
                  </div>
                ))}
              </div>
              {sport && (
                <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#00D4AA]">{sport.venue} · {sport.day}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center text-xs text-[#94A3B8]">
        * Keputusan akan dikemas kini secara berkala sepanjang 3 hari kejohanan.
      </div>
    </div>
  );
}
