import { useEffect, useState } from "react";
import { tournamentApi } from "../../lib/api";
import { ROUND_LABELS, STATUS_STYLE, STATUS_LABEL, fmtTime } from "./utils";

export default function FixturesList({ sportId }) {
  const [fixtures, setFixtures] = useState([]);
  const [round, setRound] = useState("all");

  useEffect(() => {
    tournamentApi.getFixtures(sportId).then(r => setFixtures(r.data)).catch(() => setFixtures([]));
  }, [sportId]);

  const rounds = ["all", ...Array.from(new Set(fixtures.map(f => f.round)))];
  const visible = fixtures.filter(f => round === "all" || f.round === round);

  if (fixtures.length === 0) {
    return <div className="text-center py-10 text-[#94A3B8] text-sm" data-testid="empty-fixtures">Jadual perlawanan belum dimuat naik.</div>;
  }

  return (
    <div data-testid="fixtures-list">
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
        {rounds.map(r => (
          <button
            key={r}
            onClick={() => setRound(r)}
            data-testid={`fixture-round-${r}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${round === r ? "bg-[#F97316] text-white border-[#F97316]" : "bg-[#12141A] text-[#94A3B8] border-[#2D3342]"}`}
          >
            {r === "all" ? "Semua" : (ROUND_LABELS[r] || r)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map(m => (
          <div key={m.match_id} className="bg-[#12141A] border border-[#2D3342] rounded-md p-3" data-testid={`fixture-${m.match_id}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{ROUND_LABELS[m.round] || m.round}{m.group ? ` · Kum ${m.group}` : ""}{m.match_no ? ` · #${m.match_no}` : ""}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_STYLE[m.status]}`}>
                {STATUS_LABEL[m.status] || m.status}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="text-right">
                <div className="font-semibold truncate">{m.team_a}</div>
              </div>
              <div className="text-center">
                {m.status === "scheduled" ? (
                  <div className="font-display font-black text-xl text-[#94A3B8]">VS</div>
                ) : (
                  <div className="font-display font-black text-2xl">
                    <span className={m.score_a > m.score_b ? "text-[#00D4AA]" : "text-white"}>{m.score_a}</span>
                    <span className="text-[#94A3B8] mx-1">-</span>
                    <span className={m.score_b > m.score_a ? "text-[#00D4AA]" : "text-white"}>{m.score_b}</span>
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="font-semibold truncate">{m.team_b}</div>
              </div>
            </div>
            {m.score_details && (
              <div className="mt-1 text-center text-[11px] text-[#94A3B8] font-mono">{m.score_details}</div>
            )}
            <div className="mt-2 flex justify-between text-[10px] text-[#94A3B8]">
              <span>{fmtTime(m.scheduled_at)}</span>
              <span>{m.venue || ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
