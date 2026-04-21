import { useEffect, useState } from "react";
import { tournamentApi } from "../../lib/api";

export default function GroupStandings({ sportId }) {
  const [groups, setGroups] = useState({});
  useEffect(() => {
    tournamentApi.getGroups(sportId).then(r => setGroups(r.data)).catch(() => setGroups({}));
  }, [sportId]);

  const keys = Object.keys(groups).sort();
  if (keys.length === 0) {
    return <div className="text-center py-10 text-[#94A3B8] text-sm" data-testid="empty-groups">Kumpulan belum ditetapkan untuk sukan ini.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="group-standings">
      {keys.map(g => (
        <div key={g} className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid={`group-${g}`}>
          <div className="px-4 py-3 border-b border-[#2D3342] flex items-center justify-between">
            <div className="font-display font-black text-xl uppercase">Kumpulan {g}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{groups[g].length} pasukan</div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.15em] text-[#94A3B8] border-b border-[#2D3342]">
              <tr>
                <th className="text-left p-2 pl-4">Pasukan</th>
                <th className="w-8 text-center">P</th>
                <th className="w-8 text-center">M</th>
                <th className="w-8 text-center">S</th>
                <th className="w-8 text-center">K</th>
                <th className="w-10 text-center">GD</th>
                <th className="w-10 text-center pr-4 text-[#00D4AA]">PTS</th>
              </tr>
            </thead>
            <tbody>
              {groups[g].map((r, i) => (
                <tr key={r.team_id} className={`border-b border-[#2D3342] last:border-b-0 ${i < 2 ? "bg-[#00D4AA]/5" : ""}`}>
                  <td className="p-2 pl-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-sm text-[10px] font-bold flex items-center justify-center ${i === 0 ? "bg-[#FACC15] text-[#0A0A0A]" : i === 1 ? "bg-[#00D4AA] text-[#0A0A0A]" : "bg-[#2D3342] text-[#94A3B8]"}`}>{i + 1}</span>
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        {r.agency && <div className="text-[10px] text-[#94A3B8]">{r.agency}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="text-center text-[#94A3B8]">{r.P}</td>
                  <td className="text-center">{r.W}</td>
                  <td className="text-center">{r.D}</td>
                  <td className="text-center">{r.L}</td>
                  <td className="text-center text-[#94A3B8]">{r.GD > 0 ? `+${r.GD}` : r.GD}</td>
                  <td className="text-center pr-4 font-display font-black text-[#00D4AA]">{r.Pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
