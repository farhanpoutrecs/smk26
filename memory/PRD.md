# SMK26 EventOS — Product Requirements Document

## Original Problem Statement
Build `smk26.poutrecs.com` — a mobile-first PWA web platform (EventOS) for
**Kejohanan Sukan Kementerian, Jabatan & Agensi KPKM 2026 (SMK26)**.
Scale: 1,000–2,000 participants, 15 sports, 3-day event. Organizer: Kelab Tani KPKM;
Operator: Persatuan Sukan Rekreasi Putrajaya (PSRP). Foundation for **Poutrecs EventOS**.

## User Choices (gathered)
- **Stack**: Hybrid — React + FastAPI + MongoDB, with embedded Google Forms/Sheets
- **Admin auth**: Emergent-managed Google OAuth
- **Language**: Bahasa Malaysia sahaja
- **Theme**: Modern sport energetic (dark theme, neon green #00D4AA + orange #F97316)
- **Payment**: QR placeholder (upload receipt flow)

## Architecture
- **Frontend** (`/app/frontend`): React 19, React Router v7, TailwindCSS, Shadcn/UI,
  Phosphor icons, sonner toasts, Barlow Condensed + Outfit fonts.
- **Backend** (`/app/backend/server.py`): FastAPI + Motor (MongoDB async).
  Routes prefixed `/api`. Emergent auth via `httpx` to `demobackend.emergentagent.com`.
- **DB**: MongoDB (`test_database`). Collections: users, user_sessions, registrations,
  orders, th_submissions.

## Core Modules (implemented)
- Public site: Home, About, Sports (15 dynamic pages), Schedule (3 days),
  Registration (with QR + receipt upload), Scoreboard (per-sport embeds),
  Results (podium view), Treasure Hunt (4 categories, 14 CPs, leaderboard),
  Shop (4 products with order/receipt flow), Gallery, Contact, More.
- Admin dashboard: stats, registrations table (approve/pending/reject),
  orders table (approve/pending/reject), CSV export (registrations + orders),
  Emergent Google login + session cookie.
- Layout: sticky top header + 5-item bottom nav + WhatsApp floating CTA + toasts.

## Data Models
- **User**: user_id, email, name, picture, is_admin, created_at
- **Session**: user_id, session_token, expires_at
- **Registration**: reg_id, full_name, ic_number, phone, email, team_name, sport_id,
  category, agency, payment_status (UNPAID/PENDING/PAID/REJECTED), receipt_url
- **Order**: order_id, full_name, phone, email, address, product_id, product_name,
  quantity, unit_price, total, delivery_method, payment_status, receipt_url
- **THSubmission**: submission_id, team_name, category, checkpoint_id, code,
  photo_base64, points, created_at

## Implementation Status (Feb 2026)
- [x] All 12 public pages + Admin dashboard
- [x] Backend endpoints (24/24 backend tests pass)
- [x] Frontend flows (registration, shop, treasure hunt, admin) tested end-to-end
- [x] Emergent Google Auth with 7-day session cookie
- [x] CSV export (admin)
- [x] Receipt upload (base64) with PENDING → PAID admin approval flow
- [x] Mobile-first (bottom nav, thumb-friendly, 48px targets)

## Deferred / Backlog
- **P0 (before launch)**: Flip `ALLOW_ALL_ADMINS=False`, tighten CORS to real domain.
- **P1**: Real QR code image (DuitNow/TNG) + real Google Sheets iframe per sport.
- **P1**: WhatsApp template automation (payment approved/rejected notifications).
- **P2**: PWA service worker + offline shell + "add to home screen" prompt.
- **P2**: Admin auth scoping (require explicit email whitelist).
- **P2**: Pagination on registrations/orders beyond MVP.
- **P3**: Beach Soccer module + ASEAN expansion hooks (Poutrecs EventOS).

## Next Tasks
1. User to provide real QR payment image + Google Sheets URLs per sport.
2. Tighten admin allowlist before going live.
3. Add meta tags for WhatsApp link-preview (og:image) using event hero.

## Update Log

### 2026-02 — Tournament Module (feature addition)
- **Event date changed**: 14-16 Mac 2026 → **5-7 Jun 2026**
- **Tournament system**: Format Kumpulan + Kalah Mati (4 groups of 4/4/3/3 teams)
- **Fixture management**: CSV import (teams + fixtures) with templates; manual add form
- **Live scoreboard**: Hybrid per sport — native admin scoring (10s polling) OR Google Sheet embed
- **Scorecard detail**: Free-text field for set/period scores (e.g., "21-15, 18-21, 21-19")
- **Results**: Auto-computed podium from F + 3P matches; full results list; bracket tree (QF→SF→F+3P)
- **Standings**: Auto-computed P/W/D/L/GF/GA/GD/Pts with tiebreakers
- **New pages**: `/admin/tournament/:sportId` (admin manager); enhanced `/sports/:sportId` with 5 tabs (Live, Kumpulan, Jadual, Bracket, Keputusan); rewritten `/scoreboard` (all-live across sports)
- **Collections**: teams, matches, sport_configs
- **Testing**: 53/53 pass (24 regression + 29 new tournament cases)
