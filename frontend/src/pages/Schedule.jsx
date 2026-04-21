import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SCHEDULE, EVENT_INFO } from "../data/sports";
import * as Phosphor from "@phosphor-icons/react";
import {
  CaretDown, CaretUp, Info, Star, Flag, MapPin, Clock,
  CalendarPlus, BellSimple, MapTrifold, ChartBar, ShoppingBag,
  Rocket, CameraPlus, WhatsappLogo, GoogleLogo, AppleLogo,
  QrCode, Buildings, Storefront,
} from "@phosphor-icons/react";
import {
  buildGoogleCalendarUrl, buildICSDataUrl, buildMapsUrl,
  buildWhatsAppReminder, getLiveStatus, STATUS_BADGE,
  getZone, isKeyEvent, eventSlug,
} from "../lib/schedule-utils";
import Countdown from "../components/Countdown";
import CheckInModal from "../components/CheckInModal";
import THLeaderboardMini from "../components/THLeaderboardMini";
import FlashOffer from "../components/FlashOffer";

const DAY_ACCENT = {
  "Hari 1": { bar: "#94A3B8", chip: "Soft Launch", badge: "bg-[#94A3B8]/10 text-[#94A3B8] border-[#94A3B8]/30" },
  "Hari 2": { bar: "#00D4AA", chip: "Hari Utama", badge: "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30" },
  "Hari 3": { bar: "#F97316", chip: "Grand Finale", badge: "bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30" },
};

const LABEL_STYLE = {
  HIGHLIGHT: "bg-[#FACC15] text-[#0A0A0A]",
  FINAL: "bg-[#F97316] text-white",
  "ACARA UTAMA": "bg-[#00D4AA] text-[#0A0A0A]",
};

const ZONE_ICON = { Buildings, Storefront, MapPin };

function CalendarMenu({ ev }) {
  const [open, setOpen] = useState(false);
  const gcal = buildGoogleCalendarUrl(ev);
  const ics = buildICSDataUrl(ev);
  const slug = eventSlug(ev);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        data-testid={`cal-btn-${slug}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/20 transition-colors text-[10px] font-bold uppercase tracking-wider"
      >
        <CalendarPlus size={13} weight="bold" /> Kalendar
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 z-20 bg-[#0A0A0A] border border-[#2D3342] rounded-md overflow-hidden shadow-lg min-w-[180px]" data-testid={`cal-menu-${slug}`}>
          <a href={gcal || "#"} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} data-testid={`cal-google-${slug}`} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#12141A] text-white">
            <GoogleLogo size={14} weight="bold" /> Google Calendar
          </a>
          <a href={ics || "#"} download={`smk26-${slug}.ics`} onClick={() => setOpen(false)} data-testid={`cal-apple-${slug}`} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-[#12141A] text-white border-t border-[#2D3342]">
            <AppleLogo size={14} weight="bold" /> Apple Calendar (.ics)
          </a>
        </div>
      )}
    </div>
  );
}

function ActionBar({ ev, onCheckIn }) {
  const slug = eventSlug(ev);
  const maps = buildMapsUrl(ev.venue, ev.venue_query);
  const wa = buildWhatsAppReminder(ev, EVENT_INFO.whatsapp);
  const isTH = ev.sport_id === "treasure-hunt";
  const showEshop = !!ev.highlight;
  const isPenutup = ev.title.toLowerCase().includes("penutup");
  const keyEvent = isKeyEvent(ev);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5" data-testid={`actions-${slug}`}>
      <CalendarMenu ev={ev} />

      <a href={wa} target="_blank" rel="noreferrer" data-testid={`reminder-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30 hover:bg-[#F97316]/20 text-[10px] font-bold uppercase tracking-wider">
        <BellSimple size={13} weight="bold" /> Reminder
      </a>

      <a href={maps} target="_blank" rel="noreferrer" data-testid={`maps-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#94A3B8]/10 text-white border border-[#94A3B8]/30 hover:bg-[#94A3B8]/20 text-[10px] font-bold uppercase tracking-wider">
        <MapTrifold size={13} weight="bold" /> Maps
      </a>

      {keyEvent && (
        <button onClick={() => onCheckIn(ev)} data-testid={`checkin-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#00D4AA] text-[#0A0A0A] border border-[#00D4AA] hover:bg-[#22C55E] text-[10px] font-bold uppercase tracking-wider glow-primary">
          <QrCode size={13} weight="bold" /> Check-in
        </button>
      )}

      {ev.sport_id && !isTH && (
        <Link to={`/sports/${ev.sport_id}`} data-testid={`live-score-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider">
          <ChartBar size={13} weight="bold" /> Live Score
        </Link>
      )}

      {isTH && (
        <Link to="/treasure-hunt" data-testid={`join-th-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FACC15] text-[#0A0A0A] border border-[#FACC15] hover:bg-[#EAB308] text-[10px] font-bold uppercase tracking-wider">
          <Rocket size={13} weight="bold" /> Sertai Exploration Hunt
        </Link>
      )}

      {showEshop && (
        <Link to="/shop" data-testid={`eshop-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 text-[10px] font-bold uppercase tracking-wider">
          <ShoppingBag size={13} weight="bold" /> {isPenutup ? "Beli Finisher Medal" : "Merchandise"}
        </Link>
      )}

      <a href={`https://wa.me/${EVENT_INFO.whatsapp}?text=${encodeURIComponent(`Saya share foto dari ${ev.title} SMK26. Tag @poutrecs`)}`} target="_blank" rel="noreferrer" data-testid={`upload-photo-${slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#12141A] text-[#94A3B8] border border-[#2D3342] hover:border-[#00D4AA] hover:text-white text-[10px] font-bold uppercase tracking-wider">
        <CameraPlus size={13} weight="bold" /> Upload Foto
      </a>
    </div>
  );
}

function LiveStatusBadge({ status }) {
  if (!status) return null;
  const s = STATUS_BADGE[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded ${s.cls}`} data-testid={`status-${status}`}>
      {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      {s.label}
    </span>
  );
}

function EventCard({ ev, nowTick, onCheckIn }) {
  const Icon = (ev.icon && Phosphor[ev.icon]) || Phosphor.Circle;
  const isHighlight = !!ev.highlight;
  // eslint-disable-next-line no-unused-vars
  const _tick = nowTick;
  const status = getLiveStatus(ev.start, ev.end);
  const slug = eventSlug(ev);
  const showCountdown = status === "upcoming" && isKeyEvent(ev);

  return (
    <div
      data-testid={`sched-event-${slug}`}
      className={`relative rounded-md p-4 border transition-colors ${
        isHighlight
          ? "bg-gradient-to-br from-[#12141A] to-[#12141A] border-[#FACC15]/40 shadow-[0_0_24px_rgba(250,204,21,0.08)]"
          : status === "live"
          ? "bg-[#12141A] border-red-500/40 shadow-[0_0_24px_rgba(239,68,68,0.15)]"
          : "bg-[#12141A] border-[#2D3342] hover:border-[#00D4AA]/40"
      }`}
    >
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <LiveStatusBadge status={status} />
        {ev.label && (
          <span className={`text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded ${LABEL_STYLE[ev.label] || "bg-[#F97316] text-white"}`}>
            {ev.label}
          </span>
        )}
      </div>

      <div className="flex items-start gap-3 pr-20">
        <div className={`flex-shrink-0 w-11 h-11 rounded-md flex items-center justify-center ${isHighlight ? "bg-[#FACC15]/10 text-[#FACC15]" : "bg-[#00D4AA]/10 text-[#00D4AA]"}`}>
          <Icon size={22} weight="bold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-1">
            <Clock size={12} weight="bold" />
            <span>{ev.time}</span>
          </div>
          <div className="font-display font-black uppercase text-base md:text-lg leading-tight">{ev.title}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-[#94A3B8]">
            <MapPin size={12} /> {ev.venue}
          </div>
          {ev.note && (
            <div className="mt-2 text-xs text-[#94A3B8] leading-relaxed border-l-2 border-[#2D3342] pl-2">{ev.note}</div>
          )}
        </div>
      </div>

      {showCountdown && (
        <div className="mt-3">
          <Countdown target={ev.start} />
        </div>
      )}

      <ActionBar ev={ev} onCheckIn={onCheckIn} />
    </div>
  );
}

function VenueView({ onCheckIn, nowTick }) {
  const grouped = useMemo(() => {
    const map = {};
    SCHEDULE.forEach(day => {
      day.events.forEach(ev => {
        const z = getZone(ev.venue);
        if (!map[z.zone]) map[z.zone] = { zone: z.zone, color: z.color, icon: z.icon, events: [] };
        map[z.zone].events.push({ ...ev, _day: day.day, _date: day.date });
      });
    });
    return Object.values(map);
  }, []);

  return (
    <div className="space-y-6" data-testid="venue-view">
      {grouped.map((g) => {
        const Icon = ZONE_ICON[g.icon] || MapPin;
        return (
          <section key={g.zone} className="bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden" data-testid={`zone-${g.zone.replace(/\s+/g, "-").toLowerCase()}`}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2D3342]">
              <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: `${g.color}18`, color: g.color }}>
                <Icon size={20} weight="bold" />
              </div>
              <div className="flex-1">
                <div className="font-display font-black uppercase text-base">{g.zone}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]">{g.events.length} aktiviti</div>
              </div>
            </div>
            <div className="p-3 space-y-3">
              {g.events.map((ev, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-2 text-[10px] text-[#94A3B8] uppercase tracking-[0.2em] mb-1">
                    <span>{ev._day} · {ev._date}</span>
                    <span>·</span>
                    <span>{ev.time}</span>
                  </div>
                  <EventCard ev={ev} nowTick={nowTick} onCheckIn={onCheckIn} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function Schedule() {
  const [openDays, setOpenDays] = useState({ "Hari 1": true, "Hari 2": true, "Hari 3": true });
  const [nowTick, setNowTick] = useState(0);
  const [view, setView] = useState("day"); // "day" | "venue"
  const [checkinEvent, setCheckinEvent] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNowTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const toggle = (day) => setOpenDays(o => ({ ...o, [day]: !o[day] }));

  const onCheckIn = (ev) => setCheckinEvent({ id: eventSlug(ev), title: ev.title });

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto" data-testid="schedule-page">
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#00D4AA] mb-2">Jadual Rasmi</div>
      <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">Jadual Acara</h1>
      <p className="mt-3 text-[#94A3B8] text-sm md:text-base max-w-2xl">
        3 hari · 15 sukan · Kalendar, maps, live score, check-in QR & countdown.
      </p>

      {/* View toggle: Day vs Venue */}
      <div className="mt-5 inline-flex bg-[#12141A] border border-[#2D3342] rounded-md p-1" data-testid="view-toggle">
        <button onClick={() => setView("day")} data-testid="view-day" className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${view === "day" ? "bg-[#00D4AA] text-[#0A0A0A]" : "text-[#94A3B8]"}`}>
          Ikut Hari
        </button>
        <button onClick={() => setView("venue")} data-testid="view-venue" className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${view === "venue" ? "bg-[#F97316] text-white" : "text-[#94A3B8]"}`}>
          Ikut Venue
        </button>
      </div>

      {/* Flash Offer banner */}
      <div className="mt-5">
        <FlashOffer />
      </div>

      {view === "day" && (
        <>
          <div className="mt-6 flex gap-2 flex-wrap" data-testid="schedule-quick-nav">
            {SCHEDULE.map(d => {
              const accent = DAY_ACCENT[d.day];
              return (
                <a key={d.day} href={`#${d.day.replace(" ", "-")}`} data-testid={`quick-${d.day.replace(" ", "-")}`} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border font-bold uppercase tracking-wider text-[10px] ${accent.badge}`}>
                  <span className="font-display font-black">{d.day}</span>
                  <span className="opacity-80">· {d.date.split(" ")[0]} {d.date.split(" ")[1]}</span>
                </a>
              );
            })}
          </div>

          <div className="mt-8 space-y-6">
            {SCHEDULE.map((day, dayIdx) => {
              const accent = DAY_ACCENT[day.day];
              const isOpen = openDays[day.day];
              return (
                <section id={day.day.replace(" ", "-")} key={day.day} data-testid={`day-section-${dayIdx}`} className="scroll-mt-20">
                  <button onClick={() => toggle(day.day)} data-testid={`day-toggle-${dayIdx}`} className="w-full bg-[#12141A] border border-[#2D3342] rounded-md overflow-hidden hover:border-[#00D4AA]/40 transition-colors text-left">
                    <div className="flex items-stretch">
                      <div className="w-1.5" style={{ background: accent.bar }} />
                      <div className="flex-1 p-4 md:p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] px-2 py-0.5 rounded border ${accent.badge} mb-2`}>
                              {day.day === "Hari 1" && <Flag size={11} weight="fill" />}
                              {day.day !== "Hari 1" && <Star size={11} weight="fill" />}
                              {accent.chip}
                            </div>
                            <h2 className="font-display font-black text-2xl md:text-3xl uppercase leading-tight">
                              {day.day} · <span style={{ color: accent.bar }}>{day.date}</span>
                            </h2>
                            <p className="text-xs md:text-sm text-[#94A3B8] mt-1">{day.tagline}</p>
                          </div>
                          <div className="flex-shrink-0 w-9 h-9 rounded-md bg-[#0A0A0A] border border-[#2D3342] flex items-center justify-center text-white">
                            {isOpen ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                          </div>
                        </div>
                        <div className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                          {day.events.length} aktiviti
                        </div>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 pl-4 md:pl-6 relative" data-testid={`day-body-${dayIdx}`}>
                      <div className="absolute left-0 top-2 bottom-2 w-0.5" style={{ background: `${accent.bar}40` }} />
                      {day.note && (
                        <div className="mb-4 bg-[#F97316]/5 border border-[#F97316]/30 rounded-md p-3 flex items-start gap-2 text-sm">
                          <Info size={18} weight="bold" className="text-[#F97316] flex-shrink-0 mt-0.5" />
                          <span className="text-[#F97316]">{day.note}</span>
                        </div>
                      )}
                      {/* Leaderboard shown on Day 3 (Treasure Hunt day) */}
                      {day.day === "Hari 3" && (
                        <div className="mb-4">
                          <THLeaderboardMini limit={10} />
                        </div>
                      )}
                      <div className="space-y-3">
                        {day.events.map((ev, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[22px] md:-left-[30px] top-6 w-3 h-3 rounded-full border-2" style={{ background: accent.bar, borderColor: "#0A0A0A" }} />
                            <EventCard ev={ev} nowTick={nowTick} onCheckIn={onCheckIn} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}

      {view === "venue" && (
        <div className="mt-8">
          <VenueView onCheckIn={onCheckIn} nowTick={nowTick} />
        </div>
      )}

      {/* Global social + registration CTA */}
      <div className="mt-8 bg-[#12141A] border border-[#2D3342] rounded-md p-5" data-testid="social-cta">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-[#F97316]/10 text-[#F97316] flex items-center justify-center flex-shrink-0">
            <CameraPlus size={20} weight="bold" />
          </div>
          <div>
            <div className="font-display font-black uppercase text-lg">Share Momen Anda</div>
            <p className="text-sm text-[#94A3B8] mt-1">Muat naik gambar dan video dari acara. Tag <span className="text-[#00D4AA] font-bold">@poutrecs</span> untuk dimasukkan ke galeri rasmi SMK26.</p>
            <a href={`https://wa.me/${EVENT_INFO.whatsapp}?text=${encodeURIComponent("Saya nak hantar foto/video SMK26")}`} target="_blank" rel="noreferrer" data-testid="global-upload-photo" className="mt-3 inline-flex items-center gap-2 bg-[#F97316] text-white font-bold px-4 py-2 rounded-md uppercase tracking-wider text-xs">
              <WhatsappLogo size={14} weight="fill" /> Hantar via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/registration" data-testid="schedule-cta-daftar" className="inline-flex items-center gap-2 bg-[#00D4AA] text-[#0A0A0A] font-bold px-6 py-3 rounded-md uppercase tracking-wider text-sm glow-primary">
          Daftar Kejohanan →
        </Link>
      </div>

      {checkinEvent && <CheckInModal event={checkinEvent} onClose={() => setCheckinEvent(null)} />}
    </div>
  );
}
