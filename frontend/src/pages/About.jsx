import { EVENT_INFO, AGENCIES, SPORTS } from "../data/sports";
import { Flag, Users, Medal, Heart, Buildings } from "@phosphor-icons/react";

export default function About() {
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto" data-testid="about-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#00D4AA] mb-2">Tentang</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">
        Tentang <span className="text-[#F97316]">SMK26</span>
      </h1>
      <p className="mt-4 text-[#94A3B8] text-base md:text-lg max-w-2xl">
        {EVENT_INFO.name} {EVENT_INFO.edition} ialah kejohanan sukan tahunan peringkat kebangsaan
        yang menghimpunkan kementerian, jabatan dan agensi KPKM dalam semangat kesukanan dan
        jalinan keagensian.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Flag, title: "Penganjur", body: EVENT_INFO.organizer },
          { icon: Users, title: "Operator", body: EVENT_INFO.operator },
          { icon: Medal, title: "Skala", body: `${SPORTS.length} sukan · ${AGENCIES.length} agensi · 3 hari` },
          { icon: Heart, title: "Motto", body: EVENT_INFO.motto },
        ].map((it, i) => (
          <div key={i} className="bg-[#12141A] border border-[#2D3342] rounded-md p-5">
            <div className="flex items-center gap-2 text-[#00D4AA] mb-2">
              <it.icon size={22} weight="bold" />
              <div className="text-[10px] uppercase tracking-[0.2em]">{it.title}</div>
            </div>
            <div className="font-display font-bold text-lg">{it.body}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-[#2D3342] bg-[#12141A] p-6">
        <h2 className="font-display font-black text-2xl uppercase mb-3">Objektif</h2>
        <ul className="space-y-2 text-[#94A3B8] text-sm md:text-base">
          <li>· Memperkukuh semangat setia kawan dan kerjasama antara agensi KPKM.</li>
          <li>· Menggalakkan gaya hidup cergas melalui aktiviti sukan dan rekreasi.</li>
          <li>· Menzahirkan platform interaksi tidak formal di kalangan warga KPKM.</li>
          <li>· Membina asas Poutrecs EventOS sebagai platform acara sukan kebangsaan.</li>
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-[#2D3342] bg-[#12141A] p-6" data-testid="agencies-section">
        <div className="flex items-center gap-2 text-[#F97316] mb-4">
          <Buildings size={22} weight="bold" />
          <h2 className="font-display font-black text-2xl uppercase">Agensi Peserta ({AGENCIES.length})</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {AGENCIES.map((a, i) => (
            <div key={a.code} className="flex items-start gap-3 p-3 bg-[#0A0A0A] border border-[#2D3342] rounded-md" data-testid={`agency-${a.code}`}>
              <span className="font-display font-black text-sm text-[#00D4AA] w-8 flex-shrink-0">{String(i+1).padStart(2,"0")}</span>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#F97316] font-bold">{a.code}</div>
                <div className="text-sm font-semibold leading-tight">{a.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
