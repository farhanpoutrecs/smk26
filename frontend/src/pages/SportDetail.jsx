import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SPORT_BY_ID, CATEGORY_LABEL } from "../data/sports";
import { ArrowLeft, Calendar, MapPin, Trophy, ChartLine, Target, Medal } from "@phosphor-icons/react";
import GroupStandings from "../components/tournament/GroupStandings";
import FixturesList from "../components/tournament/FixturesList";
import LiveBoard from "../components/tournament/LiveBoard";
import BracketView from "../components/tournament/BracketView";
import ResultsView from "../components/tournament/ResultsView";

// Which tabs to show per format
const FORMAT_TABS = {
  group_ko: ["live", "groups", "fixtures", "bracket", "results"],
  liga_ko: ["live", "groups", "fixtures", "bracket", "results"],
  direct_ko: ["live", "fixtures", "bracket", "results"],
  swiss: ["live", "fixtures", "results"],
  total_score: ["live", "fixtures", "results"],
  stroke_play: ["live", "fixtures", "results"],
  skill_score: ["live", "fixtures", "results"],
  treasure: ["live", "fixtures", "results"],
};

const TAB_LABELS = {
  live: "Live",
  groups: "Kumpulan",
  fixtures: "Jadual",
  bracket: "Bracket",
  results: "Keputusan",
};

export default function SportDetail() {
  const { sportId } = useParams();
  const sport = SPORT_BY_ID[sportId];
  const allowedTabs = sport ? (FORMAT_TABS[sport.format] || FORMAT_TABS.group_ko) : [];
  const [tab, setTab] = useState(allowedTabs[0] || "live");

  if (!sport) {
    return (
      <div className="px-4 py-10 text-center" data-testid="sport-not-found">
        <p className="text-[#94A3B8]">Sukan tidak dijumpai.</p>
        <Link to="/sports" className="text-[#00D4AA] font-bold uppercase tracking-wide">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto" data-testid={`sport-detail-${sport.id}`}>
      <Link to="/sports" className="inline-flex items-center gap-2 text-[#00D4AA] font-bold uppercase tracking-wider text-xs mb-4" data-testid="back-to-sports">
        <ArrowLeft size={16} /> Kembali
      </Link>
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#F97316] mb-2">{CATEGORY_LABEL[sport.category] || sport.category}</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">{sport.name}</h1>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#94A3B8]">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#12141A] border border-[#2D3342] rounded-md"><Calendar size={14} /> {sport.day}</span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#12141A] border border-[#2D3342] rounded-md"><MapPin size={14} /> {sport.venue}</span>
      </div>

      {/* Format info panel */}
      <div className="mt-4 bg-[#12141A] border border-[#2D3342] rounded-md p-4 grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="format-info">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#00D4AA] mb-1">
            <Trophy size={12} weight="bold" /> Sistem
          </div>
          <div className="text-xs font-semibold leading-tight">{sport.format_label}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#F97316] mb-1">
            <ChartLine size={12} weight="bold" /> Min Match
          </div>
          <div className="text-xs font-semibold">{sport.min_match ?? "—"}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#FACC15] mb-1">
            <Target size={12} weight="bold" /> Kelayakan
          </div>
          <div className="text-xs font-semibold leading-tight">{sport.qualifier}</div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#22C55E] mb-1">
            <Medal size={12} weight="bold" /> Knockout
          </div>
          <div className="text-xs font-semibold leading-tight">{sport.knockout}</div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 border-b border-[#2D3342]" data-testid="sport-tabs">
        {allowedTabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`tab-${t}`}
            className={`flex-shrink-0 px-4 py-2.5 -mb-px border-b-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === t ? "border-[#00D4AA] text-[#00D4AA]" : "border-transparent text-[#94A3B8] hover:text-white"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "live" && <LiveBoard sportId={sport.id} />}
        {tab === "groups" && <GroupStandings sportId={sport.id} />}
        {tab === "fixtures" && <FixturesList sportId={sport.id} />}
        {tab === "bracket" && <BracketView sportId={sport.id} />}
        {tab === "results" && <ResultsView sportId={sport.id} />}
      </div>

      <div className="mt-8">
        <Link to="/registration" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-5 py-3 rounded-md uppercase tracking-wider text-sm glow-primary" data-testid={`register-for-${sport.id}`}>
          Daftar {sport.name}
        </Link>
      </div>
    </div>
  );
}
