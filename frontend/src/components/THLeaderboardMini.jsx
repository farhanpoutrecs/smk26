import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicApi } from "../lib/api";
import { Trophy, ArrowRight } from "@phosphor-icons/react";

export default function THLeaderboardMini({ limit = 10 }) {
  const [rows, setRows] = useState([]);
  const load = () => publicApi.thLeaderboard().then(r => setRows(r.data.slice(0, limit))).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [limit]);

  return (
    <div className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid="th-leaderboard-mini">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3342]">
        <div className="flex items-center gap-2">
          <Trophy size={18} weight="fill" className="text-[#FACC15]" />
          <div className="font-display font-black uppercase text-sm">Treasure Hunt — Top {limit}</div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] pulse-dot" /> Auto 15s
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-center text-[#94A3B8] text-sm" data-testid="th-lb-empty">
          Belum ada submission. Leaderboard akan aktif pada Hari 3.
        </div>
      ) : (
        <div>
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-[#2D3342] last:border-b-0" data-testid={`th-lb-row-${i}`}>
              <div className={`w-7 h-7 rounded-sm text-xs font-display font-black flex items-center justify-center ${i === 0 ? "bg-[#FACC15] text-[#0A0A0A]" : i === 1 ? "bg-[#94A3B8] text-[#0A0A0A]" : i === 2 ? "bg-[#F97316] text-white" : "bg-[#2D3342] text-[#94A3B8]"}`}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{r.team_name}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{r.category} · {r.checkpoints} CP</div>
              </div>
              <div className="font-display font-black text-xl text-[#00D4AA]">{r.points}</div>
            </div>
          ))}
          <Link to="/treasure-hunt" className="flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[0.25em] font-bold text-[#00D4AA] hover:bg-[#0A0A0A]" data-testid="th-lb-goto">
            Leaderboard Penuh <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
