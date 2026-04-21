import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SPORTS, SPORT_BY_ID } from "../data/sports";
import { tournamentApi } from "../lib/api";
import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react";

export default function Scoreboard() {
  const [live, setLive] = useState([]);

  const load = () => {
    tournamentApi.getAllLive().then(r => setLive(r.data)).catch(() => setLive([]));
  };
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []);

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto" data-testid="scoreboard-page">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] pulse-dot" /> Live · Semua Sukan
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Skor Langsung</h1>
        </div>
        <button onClick={load} data-testid="refresh-scoreboard-btn" className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] hover:border-[#00D4AA] text-white font-bold px-4 py-2.5 rounded-md uppercase tracking-wider text-xs">
          <ArrowClockwise size={16} /> Muat Semula
        </button>
      </div>

      <section className="mt-6" data-testid="live-matches-section">
        <div className="text-[10px] uppercase tracking-[0.25em] text-red-500 font-bold mb-3">Perlawanan Langsung</div>
        {live.length === 0 ? (
          <div className="bg-[#12141A] border border-dashed border-[#2D3342] rounded-md p-8 text-center text-[#94A3B8] text-sm" data-testid="no-live-matches">
            Tiada perlawanan langsung sekarang. Semak jadual untuk perlawanan seterusnya.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {live.map(m => {
              const sport = SPORT_BY_ID[m.sport_id];
              return (
                <Link key={m.match_id} to={`/sports/${m.sport_id}`} data-testid={`live-card-${m.match_id}`} className="bg-[#12141A] border border-red-500/30 rounded-md p-4 hover:border-red-500 transition-colors glow-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{sport?.name || m.sport_id} · {m.round}{m.group ? `-${m.group}` : ""}</div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-red-500 text-white font-bold">LIVE</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="text-right font-semibold truncate">{m.team_a}</div>
                    <div className="font-display font-black text-3xl">
                      <span className={m.score_a >= m.score_b ? "text-[#00D4AA]" : ""}>{m.score_a}</span>
                      <span className="text-[#94A3B8] mx-1.5">-</span>
                      <span className={m.score_b >= m.score_a ? "text-[#00D4AA]" : ""}>{m.score_b}</span>
                    </div>
                    <div className="text-left font-semibold truncate">{m.team_b}</div>
                  </div>
                  {m.score_details && <div className="mt-1 text-center text-[10px] text-[#94A3B8] font-mono">{m.score_details}</div>}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#00D4AA] font-bold mb-3">Pilih Sukan</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SPORTS.map(s => (
            <Link key={s.id} to={`/sports/${s.id}`} data-testid={`score-sport-link-${s.id}`} className="group bg-[#12141A] border border-[#2D3342] rounded-md p-3 hover:border-[#00D4AA] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display font-bold uppercase text-sm leading-tight">{s.name}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">{s.day}</div>
                </div>
                <ArrowRight size={14} className="text-[#94A3B8] group-hover:text-[#00D4AA] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
