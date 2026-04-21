import { useState } from "react";
import { SPORTS, EVENT_INFO, AGENCIES } from "../data/sports";
import { publicApi, fileToBase64 } from "../lib/api";
import { CheckCircle, UploadSimple, WhatsappLogo } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function Registration() {
  const [form, setForm] = useState({
    full_name: "", ic_number: "", phone: "", email: "", team_name: "",
    sport_id: SPORTS[0].id, category: "individual", agency: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.ic_number || !form.phone) {
      toast.error("Sila isi semua medan wajib");
      return;
    }
    setSubmitting(true);
    try {
      const res = await publicApi.createRegistration(form);
      setResult(res.data);
      toast.success(`Pendaftaran berjaya! ID: ${res.data.reg_id}`);
    } catch (err) {
      toast.error("Ralat menghantar pendaftaran");
    } finally {
      setSubmitting(false);
    }
  };

  const onUploadReceipt = async () => {
    if (!receiptFile || !result) return;
    setUploading(true);
    try {
      const b64 = await fileToBase64(receiptFile);
      await publicApi.uploadReceipt(result.reg_id, b64);
      toast.success("Resit dimuat naik. Status: PENDING. Kami akan sahkan pembayaran.");
      setResult({ ...result, payment_status: "PENDING", receipt_url: b64 });
    } catch (err) {
      toast.error("Gagal muat naik resit");
    } finally {
      setUploading(false);
    }
  };

  if (result) {
    return (
      <div className="px-4 py-8 max-w-2xl mx-auto" data-testid="registration-success">
        <div className="bg-[#12141A] border border-[#00D4AA]/40 rounded-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle size={28} weight="fill" className="text-[#00D4AA]" />
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-[#00D4AA]">Pendaftaran Diterima</div>
              <div className="font-display font-black text-2xl uppercase">ID: {result.reg_id}</div>
            </div>
          </div>
          <p className="text-sm text-[#94A3B8]">
            Simpan ID ini. Status pembayaran anda: <span className="font-bold text-white">{result.payment_status}</span>
          </p>

          <div className="mt-6 p-4 rounded-md border border-[#2D3342] bg-[#0A0A0A]">
            <div className="text-xs uppercase tracking-[0.2em] text-[#F97316] mb-2">Langkah 2: Bayar & Muat Naik Resit</div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-40 h-40 bg-white rounded-md flex items-center justify-center text-center text-xs text-black p-3 flex-shrink-0">
                QR Pembayaran<br/>(DuitNow / TNG)<br/><span className="text-[#F97316] font-bold">RM 30</span>
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm text-[#94A3B8]">Imbas QR di sebelah, selesaikan pembayaran, lalu muat naik resit di sini.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  data-testid="receipt-file-input"
                  className="block text-sm text-[#94A3B8] file:mr-3 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-[#00D4AA] file:text-[#0A0A0A] file:font-bold file:uppercase file:text-xs"
                />
                <button
                  disabled={!receiptFile || uploading}
                  onClick={onUploadReceipt}
                  data-testid="upload-receipt-btn"
                  className="inline-flex items-center gap-2 bg-[#00D4AA] disabled:opacity-50 text-[#0A0A0A] font-bold px-5 py-2.5 rounded-md uppercase tracking-wider text-sm"
                >
                  <UploadSimple size={16} weight="bold" /> {uploading ? "Menghantar..." : "Muat Naik Resit"}
                </button>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${EVENT_INFO.whatsapp}?text=Hi, saya dah daftar SMK26 dengan ID ${result.reg_id}. Mohon sahkan pembayaran.`}
            target="_blank"
            rel="noreferrer"
            data-testid="whatsapp-confirm-btn"
            className="mt-4 inline-flex items-center gap-2 text-[#F97316] text-sm font-bold uppercase tracking-wider"
          >
            <WhatsappLogo size={16} weight="fill" /> Hantar info ke WhatsApp urus setia
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto" data-testid="registration-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#00D4AA] mb-2">Borang Pendaftaran</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Daftar Peserta</h1>
      <p className="mt-3 text-[#94A3B8] text-sm md:text-base">
        Isikan borang berikut. Yuran RM 30 seorang / RM 250 se-pasukan. Anda akan terima ID pendaftaran selepas menghantar.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3" data-testid="registration-form">
        {[
          { key: "full_name", label: "Nama Penuh *", type: "text", placeholder: "cth: Ahmad Firdaus" },
          { key: "ic_number", label: "No. Kad Pengenalan *", type: "text", placeholder: "xxxxxx-xx-xxxx" },
          { key: "phone", label: "No. Telefon WhatsApp *", type: "tel", placeholder: "01X-XXXXXXX" },
          { key: "email", label: "Emel (pilihan)", type: "email", placeholder: "nama@kpkm.gov.my" },
          { key: "team_name", label: "Nama Pasukan (jika berpasukan)", type: "text", placeholder: "cth: DOA Power" },
        ].map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">{f.label}</span>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              data-testid={`reg-input-${f.key}`}
              className="mt-1 w-full bg-[#12141A] border border-[#2D3342] rounded-md px-4 py-3 text-white placeholder-[#475569] focus:border-[#00D4AA] focus:outline-none"
            />
          </label>
        ))}

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Agensi / Jabatan *</span>
          <select
            value={form.agency}
            onChange={(e) => update("agency", e.target.value)}
            data-testid="reg-select-agency"
            className="mt-1 w-full bg-[#12141A] border border-[#2D3342] rounded-md px-4 py-3 text-white focus:border-[#00D4AA] focus:outline-none"
          >
            <option value="">— Pilih agensi —</option>
            {AGENCIES.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Sukan *</span>
          <select
            value={form.sport_id}
            onChange={(e) => update("sport_id", e.target.value)}
            data-testid="reg-select-sport"
            className="mt-1 w-full bg-[#12141A] border border-[#2D3342] rounded-md px-4 py-3 text-white focus:border-[#00D4AA] focus:outline-none"
          >
            {SPORTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-[#94A3B8]">Kategori</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {["individual", "team"].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => update("category", c)}
                data-testid={`reg-category-${c}`}
                className={`py-3 rounded-md border font-bold uppercase tracking-wider text-sm ${form.category === c ? "bg-[#F97316] text-white border-[#F97316]" : "bg-[#12141A] text-[#94A3B8] border-[#2D3342]"}`}
              >
                {c === "individual" ? "Individu" : "Berpasukan"}
              </button>
            ))}
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting}
          data-testid="submit-registration-btn"
          className="w-full mt-4 bg-[#00D4AA] disabled:opacity-50 text-[#0A0A0A] font-bold py-4 rounded-md uppercase tracking-wider glow-primary"
        >
          {submitting ? "Menghantar..." : "Hantar Pendaftaran"}
        </button>
      </form>
    </div>
  );
}
