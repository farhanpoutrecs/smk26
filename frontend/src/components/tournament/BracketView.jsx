import { useEffect, useState } from "react";
import { tournamentApi } from "../../lib/api";

const BracketCard = ({ m }) => (
  <div className="bg-[#0A0A0A] border border-[#2D3342] rounded-md p-2 min-w-[180px]">
    <div className={`flex items-center justify-between text-sm py-1 px-2 rounded ${m?.winner === m?.team_a ? "bg-[#00D4AA]/10 text-[#00D4AA]" : ""}`}>
      <span className="truncate font-semibold">{m?.team_a || "TBD"}</span>
      <span className="font-display font-bold">{m?.status === "scheduled" ? "-" : m?.score_a ?? 0}</span>
    </div>
    <div className={`flex items-center justify-between text-sm py-1 px-2 rounded ${m?.winner === m?.team_b ? "bg-[#00D4AA]/10 text-[#00D4AA]" : ""}`}>
      <span className="truncate font-semibold">{m?.team_b || "TBD"}</span>
      <span className="font-display font-bold">{m?.status === "scheduled" ? "-" : m?.score_b ?? 0}</span>
    </div>
  </div>
);

export default function BracketView({ sportId }) {
  const [b, setB] = useState({ QF: [], SF: [], F: [], "3P": [] });
  useEffect(() => { tournamentApi.getBracket(sportId).then(r => setB(r.data)); }, [sportId]);

  const rounds = [
    { key: "QF", label: "Suku Akhir" },
    { key: "SF", label: "Separuh Akhir" },
    { key: "F", label: "Akhir" },
    { key: "3P", label: "Tempat Ke-3" },
  ];
  const hasAny = rounds.some(r => (b[r.key] || []).length > 0);

  if (!hasAny) {
    return <div className="text-center py-10 text-[#94A3B8] text-sm" data-testid="empty-bracket">Bracket akan dipaparkan selepas peringkat kumpulan selesai.</div>;
  }

  return (
    <div className="overflow-x-auto pb-2" data-testid="bracket-view">
      <div className="flex gap-6 min-w-fit">
        {rounds.map(r => (
          (b[r.key] || []).length > 0 && (
            <div key={r.key} className="flex flex-col gap-4 justify-around" data-testid={`bracket-round-${r.key}`}>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#F97316] font-bold">{r.label}</div>
              {b[r.key].map(m => <BracketCard key={m.match_id} m={m} />)}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
