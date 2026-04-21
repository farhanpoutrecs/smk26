import { useEffect, useState } from "react";
import { tournamentApi } from "../../lib/api";
import { ROUND_LABELS } from "./utils";

export default function LiveBoard({ sportId }) {
  const [cfg, setCfg] = useState(null);
  const [live, setLive] = useState([]);

  useEffect(() => {
    tournamentApi.getConfig(sportId).then(r => setCfg(r.data));
  }, [sportId]);

  useEffect(() => {
    if (!cfg || cfg.scoreboard_mode !== "native") return;
    let stop = false;
    const fetchLive = () => {
      tournamentApi.getLive(sportId).then(r => { if (!stop) setLive(r.data); }).catch(() => {});
    };
    fetchLive();
    const t = setInterval(fetchLive, 10000);
    return () => { stop = true; clearInterval(t); };
  }, [sportId, cfg]);

  if (!cfg) return <div className="text-center py-10 text-[#94A3B8] text-sm">Memuatkan...</div>;

  if (cfg.scoreboard_mode === "sheet" && cfg.sheet_embed_url) {
    return (
      <div className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid="live-sheet-embed">
        <div className="px-4 py-2 border-b border-[#2D3342] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Sumber: Google Sheets</span>
        </div>
        <iframe
          src={cfg.sheet_embed_url}
          title="Live Scoreboard"
          className="w-full bg-white"
          style={{ height: "500px" }}
        />
      </div>
    );
  }

  return (
    <div data-testid="live-native">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-red-500 font-bold">Live · Auto refresh 10s</span>
      </div>
      {live.length === 0 ? (
        <div className="text-center py-10 text-[#94A3B8] text-sm" data-testid="no-live-match">Tiada perlawanan langsung sekarang.</div>
      ) : (
        <div className="space-y-3">
          {live.map(m => (
            <div key={m.match_id} className="bg-[#12141A] border border-red-500/30 rounded-md p-4 glow-secondary" data-testid={`live-${m.match_id}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{ROUND_LABELS[m.round] || m.round}{m.group ? ` · Kum ${m.group}` : ""}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-red-500 text-white font-bold">LIVE</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-right">
                  <div className="font-display font-bold uppercase text-lg leading-tight">{m.team_a}</div>
                </div>
                <div className="font-display font-black text-5xl md:text-6xl">
                  <span className={m.score_a >= m.score_b ? "text-[#00D4AA]" : "text-white"}>{m.score_a}</span>
                  <span className="text-[#94A3B8] mx-2">–</span>
                  <span className={m.score_b >= m.score_a ? "text-[#00D4AA]" : "text-white"}>{m.score_b}</span>
                </div>
                <div className="text-left">
                  <div className="font-display font-bold uppercase text-lg leading-tight">{m.team_b}</div>
                </div>
              </div>
              {m.score_details && (
                <div className="mt-2 text-center text-xs text-[#94A3B8] font-mono">{m.score_details}</div>
              )}
              <div className="mt-2 text-center text-[10px] text-[#94A3B8]">{m.venue || ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
