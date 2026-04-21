export const ROUND_LABELS = {
  group: "Peringkat Kumpulan",
  QF: "Suku Akhir",
  SF: "Separuh Akhir",
  F: "Akhir",
  "3P": "Tempat Ketiga",
};

export const STATUS_STYLE = {
  scheduled: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30",
  live: "bg-red-500/10 text-red-500 border-red-500/30",
  finished: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30",
};

export const STATUS_LABEL = {
  scheduled: "Akan Datang",
  live: "LANGSUNG",
  finished: "Selesai",
};

export function fmtTime(iso) {
  if (!iso) return "TBD";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("ms-MY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
