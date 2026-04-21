import { useState } from "react";
import { X, CheckCircle, QrCode } from "@phosphor-icons/react";
import { AGENCIES } from "../data/sports";
import { publicApi } from "../lib/api";
import { toast } from "sonner";

export default function CheckInModal({ event, onClose }) {
  const [form, setForm] = useState({ full_name: "", phone: "", agency: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const submit = async () => {
    if (!form.full_name || !form.phone) { toast.error("Nama & telefon wajib"); return; }
    setBusy(true);
    try {
      const res = await publicApi.createCheckin({
        event_id: event.id,
        event_title: event.title,
        ...form,
      });
      setDone(res.data);
      toast.success("Check-in berjaya!");
    } catch {
      toast.error("Check-in gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" data-testid="checkin-modal">
      <div className="bg-[#12141A] border border-[#2D3342] rounded-t-2xl md:rounded-lg w-full md:max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#2D3342]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] flex items-center justify-center">
              <QrCode size={18} weight="bold" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Check-in</div>
              <div className="font-display font-black uppercase text-sm">{event.title}</div>
            </div>
          </div>
          <button onClick={onClose} data-testid="close-checkin-modal" className="w-9 h-9 flex items-center justify-center rounded-md bg-[#0A0A0A] border border-[#2D3342]">
            <X size={18} />
          </button>
        </div>

        {!done ? (
          <div className="p-4 space-y-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Nama Penuh *</span>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} data-testid="checkin-name" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">No. Telefon *</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} data-testid="checkin-phone" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">Agensi</span>
              <select value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} data-testid="checkin-agency" className="mt-1 w-full bg-[#0A0A0A] border border-[#2D3342] rounded-md px-3 py-2.5 text-sm">
                <option value="">— Pilih —</option>
                {AGENCIES.map(a => <option key={a.code} value={a.code}>{a.code} – {a.name.split("(")[0].trim()}</option>)}
              </select>
            </label>
            <button onClick={submit} disabled={busy} data-testid="submit-checkin" className="w-full bg-[#00D4AA] disabled:opacity-50 text-[#0A0A0A] font-bold py-3 rounded-md uppercase tracking-wider glow-primary">
              {busy ? "Menghantar..." : "Check-in Sekarang"}
            </button>
            <p className="text-[10px] text-center text-[#94A3B8]">Data anda hanya digunakan untuk rekod kehadiran acara.</p>
          </div>
        ) : (
          <div className="p-6 text-center space-y-3" data-testid="checkin-success">
            <CheckCircle size={48} weight="fill" className="text-[#00D4AA] mx-auto" />
            <div className="font-display font-black text-2xl uppercase">Berjaya!</div>
            <div className="font-mono text-sm text-[#F97316]">ID: {done.checkin_id}</div>
            <p className="text-sm text-[#94A3B8]">Simpan skrin ini sebagai bukti check-in. Selamat menyertai {event.title}.</p>
            <button onClick={onClose} className="mt-4 inline-flex items-center gap-2 bg-[#12141A] border border-[#2D3342] text-white px-4 py-2 rounded-md uppercase tracking-wider text-xs">Tutup</button>
          </div>
        )}
      </div>
    </div>
  );
}
