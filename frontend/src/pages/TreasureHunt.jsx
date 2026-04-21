import { useEffect, useState } from "react";
import { publicApi, fileToBase64 } from "../lib/api";
import { toast } from "sonner";
import { MapTrifold, Trophy, UploadSimple, CheckCircle } from "@phosphor-icons/react";

const CATEGORIES = [
  { value: "cycling", label: "Cycling" },
  { value: "briskwalk", label: "Brisk Walk" },
  { value: "maze_runner", label: "Maze Runner" },
  { value: "fun_open", label: "Fun / Open" },
];

export default function TreasureHunt() {
  const [form, setForm] = useState({
    team_name: "",
    category: "cycling",
    checkpoint_id: "",
    code: "",
  });
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);

  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("");

  const loadLeaderboard = () => {
    publicApi
      .thLeaderboard(filter || undefined)
      .then((r) => setRows(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadLeaderboard();
    const t = setInterval(loadLeaderboard, 15000);
    return () => clearInterval(t);
  }, [filter]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.team_name.trim() || !form.checkpoint_id.trim()) {
      toast.error("Sila isi nama pasukan & checkpoint");
      return;
    }
    setBusy(true);
    try {
      let photo_base64 = null;
      if (photo) photo_base64 = await fileToBase64(photo);
      const res = await publicApi.thSubmit({ ...form, photo_base64 });
      setLastSubmission(res.data);
      setForm((f) => ({ ...f, checkpoint_id: "", code: "" }));
      setPhoto(null);
      toast.success("Checkpoint dihantar!");
      loadLeaderboard();
    } catch {
      toast.error("Gagal menghantar checkpoint");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto" data-testid="treasure-hunt-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#00D4AA] mb-2">
        Open Event
      </div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight flex items-center gap-3">
        <MapTrifold size={40} weight="fill" className="text-[#22C55E]" />
        Treasure <span className="text-[#F97316]">Hunt</span>
      </h1>
      <p className="mt-4 text-[#94A3B8] text-base md:text-lg max-w-2xl">
        Hantar bukti checkpoint anda. Setiap submission bernilai 10 mata.
        Leaderboard dikemaskini setiap 15 saat.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission form */}
        <div className="bg-[#12141A] border border-[#2D3342] rounded-md p-5" data-testid="th-submit-card">
          <div className="flex items-center gap-2 text-[#00D4AA] mb-4">
            <UploadSimple size={22} weight="bold" />
            <div className="text-[10px] uppercase tracking-[0.2em]">Hantar Checkpoint</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Nama Pasukan</label>
              <input
                data-testid="th-team-name"
                value={form.team_name}
                onChange={(e) => update("team_name", e.target.value)}
                className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4AA]"
                placeholder="cth: Team Alpha"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Kategori</label>
              <select
                data-testid="th-category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4AA]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Checkpoint ID</label>
              <input
                data-testid="th-checkpoint-id"
                value={form.checkpoint_id}
                onChange={(e) => update("checkpoint_id", e.target.value)}
                className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4AA]"
                placeholder="cth: CP-03"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Kod Rahsia (pilihan)</label>
              <input
                data-testid="th-code"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4AA]"
                placeholder="cth: SMK-2025"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Foto Bukti (pilihan)</label>
              <input
                data-testid="th-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="mt-1 w-full text-sm text-[#94A3B8] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:uppercase file:tracking-wider file:bg-[#2D3342] file:text-white hover:file:bg-[#00D4AA] hover:file:text-[#0A0A0A]"
              />
            </div>

            <button
              data-testid="th-submit-btn"
              disabled={busy}
              onClick={submit}
              className="mt-2 w-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#0A0A0A] font-display font-black uppercase tracking-wider py-3 rounded-md transition-colors"
            >
              {busy ? "Menghantar..." : "Hantar Checkpoint"}
            </button>

            {lastSubmission && (
              <div className="mt-3 flex items-start gap-2 bg-[#0A0A0A] border border-[#22C55E] rounded-md p-3 text-sm" data-testid="th-last-submission">
                <CheckCircle size={20} weight="fill" className="text-[#22C55E] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Checkpoint direkod</div>
                  <div className="text-[#94A3B8] text-xs">
                    {lastSubmission.team_name} · {lastSubmission.checkpoint_id} · +{lastSubmission.points} mata
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid="th-leaderboard-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2D3342]">
            <div className="flex items-center gap-2">
              <Trophy size={18} weight="fill" className="text-[#FACC15]" />
              <div className="font-display font-black uppercase text-sm">Leaderboard</div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] pulse-dot" /> Auto 15s
            </div>
          </div>

          <div className="px-4 py-3 border-b border-[#2D3342] flex flex-wrap gap-2">
            <button
              data-testid="th-filter-all"
              onClick={() => setFilter("")}
              className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border ${filter === "" ? "bg-[#00D4AA] text-[#0A0A0A] border-[#00D4AA]" : "border-[#2D3342] text-[#94A3B8] hover:text-white"}`}
            >
              Semua
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                data-testid={`th-filter-${c.value}`}
                onClick={() => setFilter(c.value)}
                className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border ${filter === c.value ? "bg-[#00D4AA] text-[#0A0A0A] border-[#00D4AA]" : "border-[#2D3342] text-[#94A3B8] hover:text-white"}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <div className="p-8 text-center text-[#94A3B8] text-sm" data-testid="th-lb-empty">
              Belum ada submission untuk kategori ini.
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
