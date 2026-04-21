// Utilities for schedule: calendar, reminder (WhatsApp), maps, live status.

// Format local datetime string "YYYY-MM-DDTHH:MM" to ICS UTC format "YYYYMMDDTHHMMSSZ"
// Assumes Malaysia timezone UTC+8.
function toICSDate(localIso) {
  if (!localIso) return null;
  // parse YYYY-MM-DDTHH:MM as Malaysia local time
  const d = new Date(localIso + ":00+08:00");
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export function buildGoogleCalendarUrl(ev) {
  const start = toICSDate(ev.start);
  const end = toICSDate(ev.end || ev.start);
  if (!start) return null;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `SMK26 · ${ev.title}`,
    dates: `${start}/${end}`,
    details: `${ev.note || ""}\n\nJadual rasmi SMK26: https://smk26.poutrecs.com/schedule`,
    location: ev.venue || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildICSDataUrl(ev) {
  const start = toICSDate(ev.start);
  const end = toICSDate(ev.end || ev.start);
  if (!start) return null;
  const uid = `${ev.title.replace(/\s+/g, "-").toLowerCase()}-${start}@smk26.poutrecs.com`;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SMK26//EventOS//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${start}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:SMK26 · ${ev.title}`,
    `LOCATION:${ev.venue || ""}`,
    `DESCRIPTION:${(ev.note || "").replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}

export function buildMapsUrl(venue, venue_query) {
  const q = encodeURIComponent(venue_query || venue || "MAEPS Serdang");
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function buildWhatsAppReminder(ev, eventWhatsapp) {
  const msg = `Saya nak set reminder untuk *${ev.title}* pada ${ev.time} di ${ev.venue}. Tolong ingatkan saya 1 hari sebelum.`;
  return `https://wa.me/${eventWhatsapp}?text=${encodeURIComponent(msg)}`;
}

// Given "YYYY-MM-DDTHH:MM" local (UTC+8), compare to now.
// Returns: "live" | "upcoming" | "completed" | null
export function getLiveStatus(start, end) {
  if (!start) return null;
  const now = new Date();
  const s = new Date(start + ":00+08:00");
  const e = end ? new Date(end + ":00+08:00") : new Date(s.getTime() + 3 * 60 * 60 * 1000);
  if (now < s) return "upcoming";
  if (now >= s && now <= e) return "live";
  return "completed";
}

export const STATUS_BADGE = {
  live: { label: "LIVE", cls: "bg-red-500 text-white animate-pulse" },
  upcoming: { label: "COMING SOON", cls: "bg-[#94A3B8]/20 text-[#94A3B8] border border-[#94A3B8]/30" },
  completed: { label: "COMPLETED", cls: "bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30" },
};

// Map venue → zone
export const VENUE_ZONES = {
  "IOI City Mall": { zone: "IOI City Mall", color: "#F97316", icon: "Storefront" },
  "Uptown Bangi": { zone: "Bangi Area", color: "#FACC15", icon: "Buildings" },
  "Bangi Golf Resort": { zone: "Bangi Area", color: "#FACC15", icon: "Flag" },
};

export function getZone(venue) {
  if (!venue) return { zone: "MAEPS Zone", color: "#00D4AA", icon: "MapPin" };
  if (VENUE_ZONES[venue]) return VENUE_ZONES[venue];
  // default: anything containing "MAEPS"
  if (venue.toUpperCase().includes("MAEPS") || venue.toLowerCase().includes("stadium")) {
    return { zone: "MAEPS Zone", color: "#00D4AA", icon: "MapPin" };
  }
  if (venue.toLowerCase().includes("bangi")) return { zone: "Bangi Area", color: "#FACC15", icon: "Buildings" };
  if (venue.toLowerCase().includes("ioi")) return { zone: "IOI City Mall", color: "#F97316", icon: "Storefront" };
  return { zone: "MAEPS Zone", color: "#00D4AA", icon: "MapPin" };
}

// Countdown between now and target local iso (UTC+8). Returns {days,hours,mins,secs,expired}
export function computeCountdown(targetIso) {
  if (!targetIso) return null;
  const target = new Date(targetIso + ":00+08:00");
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, expired: false };
}

// Which events get countdown + check-in
export function isKeyEvent(ev) {
  const t = (ev.title || "").toLowerCase();
  return t.includes("final tarik tali") ||
         t.includes("exploration hunt") ||
         t.includes("penutup");
}

export function eventSlug(ev) {
  return (ev.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
