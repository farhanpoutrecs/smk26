import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { authApi, tournamentApi } from "../lib/api";
import { SPORT_BY_ID, SPORTS } from "../data/sports";
import { ArrowLeft, UploadSimple, Download, Trash, Play, CheckCircle, FloppyDisk, Plus } from "@phosphor-icons/react";
import { toast } from "sonner";

const TEAMS_CSV_TEMPLATE = "name,group,agency,players\nDOA United,A,DOA,\"Ahmad,Syed,Kamal\"\nFAMA FC,A,FAMA,\nMARDI Tigers,A,MARDI,\nLPP Eagles,A,LPP,\n";
const FIXTURES_CSV_TEMPLATE = "round,group,match_no,team_a,team_b,venue,scheduled_at\ngroup,A,1,DOA United,FAMA FC,Padang A,2026-06-05T09:00\ngroup,A,2,MARDI Tigers,LPP Eagles,Padang A,2026-06-05T10:30\nQF,,1,Winner A,Runner-up B,Padang A,2026-06-06T14:00\n";

const ROUND_OPTIONS = [
  { value: "group", label: "Kumpulan" },
  { value: "QF", label: "Suku Akhir" },
  { value: "SF", label: "Separuh Akhir" },
  { value: "F", label: "Akhir" },
  { value: "3P", label: "Tempat Ke-3" },
];

export default function TournamentAdmin() {
  const { sportId } = useParams();
  const sport = SPORT_BY_ID[sportId] || SPORTS[0];
  const [authState, setAuthState] = useState("loading");
  const [tab, setTab] = useState("teams");
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [config, setConfig] = useState({ scoreboard_mode: "native", sheet_embed_url: "" });
  const [csvText, setCsvText] = useState("");
  const [newTeam, setNewTeam] = useState({ name: "", group: "A", agency: "" });
  const [newMatch, setNewMatch] = useState({ round: "group", group: "A", match_no: 1, team_a: "", team_b: "", venue: "", scheduled_at: "" });

  useEffect(() => {
    authApi.me().then(() => setAuthState("ok")).catch(() => setAuthState("no"));
  }, []);

  const load = async () => {
    const [t, f, c] = await Promise.all([
      tournamentApi.getTeams(sport.id),
      tournamentApi.getFixtures(sport.id),
      tournamentApi.getConfig(sport.id),
    ]);
    setTeams(t.data);
    setFixtures(f.data);
    setConfig({ scoreboard_mode: c.data.scoreboard_mode || "native", sheet_embed_url: c.data.sheet_embed_url || "" });
  };

  useEffect(() => { if (authState === "ok") load(); }, [authState, sport.id]);

  if (authState === "loading") return <div className="p-10 text-center text-[#94A3B8]">Memuatkan...</div>;
  if (authState === "no") return <Navigate to="/admin/login" replace />;

  const importTeams = async () => {
    if (!csvText.trim()) { toast.error("Sila tampal CSV"); return; }
    try {
      const r = await tournamentApi.importTeams(sport.id, csvText);
      toast.success(`${r.data.inserted} pasukan diimport`);
      setCsvText(""); load();
    } catch { toast.error("Import gagal. Semak format CSV."); }
  };

  const importFixtures = async () => {
    if (!csvText.trim()) { toast.error("Sila tampal CSV"); return; }
    try {
      const r = await tournamentApi.importFixtures(sport.id, csvText);
      toast.success(`${r.data.inserted} perlawanan diimport`);
      setCsvText(""); load();
    } catch { toast.error("Import gagal. Semak format CSV."); }
  };

  const addTeam = async () => {
    if (!newTeam.name) return;
    await tournamentApi.createTeam({ sport_id: sport.id, ...newTeam });
    setNewTeam({ name: "", group: "A", agency: "" });
    load();
  };

  const addMatch = async () => {
    if (!newMatch.team_a || !newMatch.team_b) return;
    await tournamentApi.createMatch({
      sport_id: sport.id,
      round: newMatch.round,
      group: newMatch.group || null,
      match_no: parseInt(newMatch.match_no) || null,
      team_a: newMatch.team_a, team_b: newMatch.team_b,
      venue: newMatch.venue || null,
      scheduled_at: newMatch.scheduled_at || null,
    });
    load();
  };

  const setMatchField = async (match_id, patch) => {
    await tournamentApi.updateMatch(match_id, patch);
    load();
  };

  const saveConfig = async () => {
    await tournamentApi.updateConfig(sport.id, config);
    toast.success("Konfigurasi disimpan");
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto" data-testid="tournament-admin">
      <Link to="/admin" className="inline-flex items-center gap-2 text-[#00D4AA] font-bold uppercase tracking-wider text-xs mb-3" data-testid="back-to-admin">
        <ArrowLeft size={16} /> Dashboard Admin
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316]">Sistem Pertandingan</div>
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase leading-tight">{sport.name}</h1>
        </div>
        <select
          value={sport.id}
          onChange={(e) => window.location.href = `/admin/tournament/${e.target.value}`}
          data-testid="switch-sport"
          className="bg-[#12141A] border border-[#2D3342] rounded-md px-3 py-2 text-sm"
        >
          {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 border-b border-[#2D3342]">
        {["teams","fixtures","live","config"].map(t => (
          <button key={t} onClick={() => setTab(t)} data-testid={`admin-tourn-tab-${t}`} className={`flex-shrink-0 px-4 py-2.5 -mb-px border-b-2 text-xs font-bold uppercase tracking-wider ${tab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-[#94A3B8]"}`}>
            {t === "teams" ? `Pasukan (${teams.length})` : t === "fixtures" ? `Jadual (${fixtures.length})` : t === "live" ? "Live Scoring" : "Konfigurasi"}
          </button>
        ))}
      </div>

      {tab === "teams" && (
        <div className="mt-6 space-y-4" data-testid="admin-teams">
          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#00D4AA] mb-2">Import CSV</div>
            <p className="text-xs text-[#94A3B8] mb-2">Header: <code className="text-[#F97316]">name,group,agency,players</code></p>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={TEAMS_CSV_TEMPLATE}
              data-testid="teams-csv-textarea"
              rows={6}
              className="w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md p-3 text-sm font-mono text-white focus:border-[#00D4AA] focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button onClick={importTeams} data-testid="import-teams-btn" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><UploadSimple size={14}/> Import</button>
              <button onClick={() => setCsvText(TEAMS_CSV_TEMPLATE)} className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] text-white px-4 py-2 rounded-md uppercase tracking-wider text-xs">Template</button>
            </div>
          </div>

          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#F97316] mb-2">Tambah Pasukan</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input placeholder="Nama pasukan" value={newTeam.name} onChange={(e)=>setNewTeam({...newTeam,name:e.target.value})} data-testid="new-team-name" className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <select value={newTeam.group} onChange={(e)=>setNewTeam({...newTeam,group:e.target.value})} data-testid="new-team-group" className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm">
                {["A","B","C","D"].map(g=><option key={g} value={g}>Kumpulan {g}</option>)}
              </select>
              <input placeholder="Agensi" value={newTeam.agency} onChange={(e)=>setNewTeam({...newTeam,agency:e.target.value})} className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <button onClick={addTeam} data-testid="add-team-btn" className="inline-flex items-center justify-center gap-1 bg-[#F97316] text-white font-bold px-3 py-2 rounded-md uppercase text-xs"><Plus size={14}/> Tambah</button>
            </div>
          </div>

          <div className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] border-b border-[#2D3342]">
                <tr><th className="text-left p-3">Pasukan</th><th className="p-3">Kum</th><th className="p-3">Agensi</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {teams.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-[#94A3B8]">Belum ada pasukan</td></tr>}
                {teams.map(t => (
                  <tr key={t.team_id} className="border-b border-[#2D3342] last:border-b-0" data-testid={`team-row-${t.team_id}`}>
                    <td className="p-3 font-semibold">{t.name}</td>
                    <td className="p-3 text-center text-[#00D4AA] font-display font-bold">{t.group || "-"}</td>
                    <td className="p-3 text-[#94A3B8] text-xs">{t.agency || "-"}</td>
                    <td className="p-3"><button onClick={() => tournamentApi.deleteTeam(t.team_id).then(load)} className="text-red-400 hover:text-red-500"><Trash size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "fixtures" && (
        <div className="mt-6 space-y-4" data-testid="admin-fixtures">
          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#00D4AA] mb-2">Import CSV</div>
            <p className="text-xs text-[#94A3B8] mb-2">Header: <code className="text-[#F97316]">round,group,match_no,team_a,team_b,venue,scheduled_at</code> (round: group/QF/SF/F/3P)</p>
            <textarea value={csvText} onChange={(e)=>setCsvText(e.target.value)} rows={6} placeholder={FIXTURES_CSV_TEMPLATE} data-testid="fixtures-csv-textarea" className="w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md p-3 text-sm font-mono focus:border-[#00D4AA] focus:outline-none" />
            <div className="mt-2 flex gap-2">
              <button onClick={importFixtures} data-testid="import-fixtures-btn" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><UploadSimple size={14}/> Import</button>
              <button onClick={() => setCsvText(FIXTURES_CSV_TEMPLATE)} className="inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] text-white px-4 py-2 rounded-md uppercase tracking-wider text-xs">Template</button>
              <a href={tournamentApi.exportFixturesUrl(sport.id)} className="inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><Download size={14}/> Eksport</a>
            </div>
          </div>

          <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-[#F97316] mb-2">Tambah Perlawanan</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select value={newMatch.round} onChange={(e)=>setNewMatch({...newMatch,round:e.target.value})} data-testid="new-match-round" className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm">
                {ROUND_OPTIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select value={newMatch.group} onChange={(e)=>setNewMatch({...newMatch,group:e.target.value})} className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm">
                {["","A","B","C","D"].map(g=><option key={g} value={g}>{g ? `Kum ${g}` : "—"}</option>)}
              </select>
              <input placeholder="Pasukan A" value={newMatch.team_a} onChange={(e)=>setNewMatch({...newMatch,team_a:e.target.value})} data-testid="new-match-team-a" className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <input placeholder="Pasukan B" value={newMatch.team_b} onChange={(e)=>setNewMatch({...newMatch,team_b:e.target.value})} data-testid="new-match-team-b" className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <input placeholder="Venue" value={newMatch.venue} onChange={(e)=>setNewMatch({...newMatch,venue:e.target.value})} className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <input type="datetime-local" value={newMatch.scheduled_at} onChange={(e)=>setNewMatch({...newMatch,scheduled_at:e.target.value})} className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <input type="number" placeholder="No" value={newMatch.match_no} onChange={(e)=>setNewMatch({...newMatch,match_no:e.target.value})} className="bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <button onClick={addMatch} data-testid="add-match-btn" className="inline-flex items-center justify-center gap-1 bg-[#F97316] text-white font-bold px-3 py-2 rounded-md uppercase text-xs"><Plus size={14}/> Tambah</button>
            </div>
          </div>

          <div className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] border-b border-[#2D3342]">
                <tr><th className="text-left p-3">Round</th><th className="p-3">Perlawanan</th><th className="p-3">Skor</th><th className="p-3">Status</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {fixtures.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-[#94A3B8]">Belum ada perlawanan</td></tr>}
                {fixtures.map(m => (
                  <tr key={m.match_id} className="border-b border-[#2D3342] last:border-b-0" data-testid={`admin-match-${m.match_id}`}>
                    <td className="p-3 text-xs">{m.round}{m.group ? `-${m.group}` : ""} #{m.match_no || "-"}</td>
                    <td className="p-3">{m.team_a} vs {m.team_b}<div className="text-[10px] text-[#94A3B8]">{m.venue} · {m.scheduled_at}</div></td>
                    <td className="p-3 font-display font-bold">{m.score_a} - {m.score_b}</td>
                    <td className="p-3 text-xs">{m.status}</td>
                    <td className="p-3"><button onClick={() => tournamentApi.deleteMatch(m.match_id).then(load)} className="text-red-400"><Trash size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "live" && (
        <div className="mt-6 space-y-3" data-testid="admin-live">
          <div className="text-xs text-[#94A3B8]">Kemaskini skor, set details & status untuk setiap perlawanan.</div>
          {fixtures.length === 0 && <div className="text-center py-10 text-[#94A3B8]">Tambah perlawanan dahulu.</div>}
          {fixtures.map(m => (
            <div key={m.match_id} className="bg-[#12141A] border border-[#2D3342] rounded-md p-4" data-testid={`live-scorer-${m.match_id}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{m.round}{m.group ? ` · Kum ${m.group}` : ""} #{m.match_no || "-"} · {m.venue}</div>
                <div className="flex gap-1">
                  <button onClick={() => setMatchField(m.match_id, { status: "live" })} data-testid={`set-live-${m.match_id}`} className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold"><Play size={12}/> LIVE</button>
                  <button onClick={() => setMatchField(m.match_id, { status: "finished" })} data-testid={`set-finished-${m.match_id}`} className="inline-flex items-center gap-1 bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 px-2 py-1 rounded text-[10px] uppercase font-bold"><CheckCircle size={12}/> Selesai</button>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div>
                  <div className="font-semibold text-sm mb-1">{m.team_a}</div>
                  <input type="number" defaultValue={m.score_a} onBlur={(e)=>setMatchField(m.match_id, { score_a: parseInt(e.target.value || 0) })} data-testid={`score-a-${m.match_id}`} className="w-20 bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-center font-display font-bold text-2xl" />
                </div>
                <div className="font-display font-black text-[#94A3B8]">VS</div>
                <div className="text-right">
                  <div className="font-semibold text-sm mb-1">{m.team_b}</div>
                  <input type="number" defaultValue={m.score_b} onBlur={(e)=>setMatchField(m.match_id, { score_b: parseInt(e.target.value || 0) })} data-testid={`score-b-${m.match_id}`} className="w-20 bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-center font-display font-bold text-2xl" />
                </div>
              </div>
              <input type="text" defaultValue={m.score_details || ""} onBlur={(e)=>setMatchField(m.match_id, { score_details: e.target.value })} placeholder="Scorecard (cth: 21-15, 18-21, 21-19)" data-testid={`score-details-${m.match_id}`} className="mt-3 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm font-mono" />
            </div>
          ))}
        </div>
      )}

      {tab === "config" && (
        <div className="mt-6 bg-[#12141A] border border-[#2D3342] rounded-md p-5 max-w-2xl" data-testid="admin-config">
          <div className="text-xs uppercase tracking-[0.2em] text-[#00D4AA] mb-3">Konfigurasi Scoreboard</div>
          <label className="block mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Mod Scoreboard</span>
            <select value={config.scoreboard_mode} onChange={(e)=>setConfig({...config,scoreboard_mode:e.target.value})} data-testid="config-mode" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm">
              <option value="native">Native (admin kemaskini langsung)</option>
              <option value="sheet">Google Sheet Embed</option>
            </select>
          </label>
          {config.scoreboard_mode === "sheet" && (
            <label className="block mb-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">URL Embed Google Sheet</span>
              <input value={config.sheet_embed_url} onChange={(e)=>setConfig({...config,sheet_embed_url:e.target.value})} placeholder="https://docs.google.com/spreadsheets/d/.../pubhtml?..." data-testid="config-sheet-url" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm" />
              <span className="text-[10px] text-[#94A3B8]">Google Sheets → File → Share → Publish to web → Embed → tampal <code>src</code> URL</span>
            </label>
          )}
          <button onClick={saveConfig} data-testid="save-config-btn" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs"><FloppyDisk size={14}/> Simpan</button>
        </div>
      )}
    </div>
  );
}
