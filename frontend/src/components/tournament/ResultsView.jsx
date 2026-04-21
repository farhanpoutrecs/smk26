import { useEffect, useState } from "react";
import { tournamentApi } from "../../lib/api";
import { ROUND_LABELS } from "./utils";
import { Trophy, Medal } from "@phosphor-icons/react";

export default function ResultsView({ sportId }) {
  const [finished, setFinished] = useState([]);
  const [bracket, setBracket] = useState({ QF: [], SF: [], F: [], "3P": [] });

  useEffect(() => {
    tournamentApi.getFixtures(sportId, { status: "finished" }).then(r => setFinished(r.data));
    tournamentApi.getBracket(sportId).then(r => setBracket(r.data));
  }, [sportId]);

  const finalMatch = (bracket.F || []).find(m => m.status === "finished");
  const thirdPlace = (bracket["3P"] || []).find(m => m.status === "finished");

  let podium = null;
  if (finalMatch) {
    const first = finalMatch.winner;
    const second = finalMatch.team_a === first ? finalMatch.team_b : finalMatch.team_a;
    const third = thirdPlace ? thirdPlace.winner : null;
    podium = { first, second, third };
  }

  return (
    <div className="space-y-6" data-testid="results-view">
      {podium && (
        <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-5">
          <div className="text-xs uppercase tracking-[0.25em] text-[#FACC15] flex items-center gap-2 mb-4">
            <Trophy size={16} weight="fill" /> Juara Kejohanan
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="text-center order-1">
              <Medal size={28} weight="fill" className="text-[#94A3B8] mx-auto mb-1" />
              <div className="bg-[#94A3B8]/10 border border-[#94A3B8]/30 rounded-md p-3 h-24 flex flex-col justify-end">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Naib Johan</div>
                <div className="font-display font-bold text-sm">{podium.second || "—"}</div>
              </div>
            </div>
            <div className="text-center order-2">
              <Trophy size={36} weight="fill" className="text-[#FACC15] mx-auto mb-1" />
              <div className="bg-[#FACC15]/10 border border-[#FACC15]/40 rounded-md p-4 h-32 flex flex-col justify-end">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#FACC15]">Johan</div>
                <div className="font-display font-bold text-base">{podium.first || "—"}</div>
              </div>
            </div>
            <div className="text-center order-3">
              <Medal size={28} weight="fill" className="text-[#F97316] mx-auto mb-1" />
              <div className="bg-[#F97316]/10 border border-[#F97316]/30 rounded-md p-3 h-20 flex flex-col justify-end">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#F97316]">Ketiga</div>
                <div className="font-display font-bold text-sm">{podium.third || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#00D4AA] font-bold mb-2">Semua Keputusan</div>
        {finished.length === 0 ? (
          <div className="text-center py-6 text-[#94A3B8] text-sm" data-testid="no-results">Belum ada perlawanan selesai.</div>
        ) : (
          <div className="space-y-2">
            {finished.map(m => (
              <div key={m.match_id} className="bg-[#12141A] border border-[#2D3342] rounded-md p-3" data-testid={`result-${m.match_id}`}>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-1">
                  {ROUND_LABELS[m.round] || m.round}{m.group ? ` · Kumpulan ${m.group}` : ""}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className={`text-right font-semibold ${m.winner === m.team_a ? "text-[#00D4AA]" : ""}`}>{m.team_a}</div>
                  <div className="font-display font-black text-xl">
                    {m.score_a} <span className="text-[#94A3B8]">-</span> {m.score_b}
                  </div>
                  <div className={`text-left font-semibold ${m.winner === m.team_b ? "text-[#00D4AA]" : ""}`}>{m.team_b}</div>
                </div>
                {m.score_details && <div className="mt-1 text-center text-[11px] text-[#94A3B8] font-mono">{m.score_details}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
