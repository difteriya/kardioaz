# Kardio.az — Custom Rebuild Project Plan

> **Status:** Planning complete. Build starts in a later session.
> **Priority:** SEO-first. Every page and post must be SEO-optimized.
> **Language:** Azerbaijani (az) only.
> **Last updated:** 2026-07-14

---

## 1. Project summary

Rebuild the existing WordPress site **kardio.az** (solo cardiologist Dr. Kənan Əhmədov —
*"Sizin ürək həkiminiz"*) as a **custom Next.js frontend on a headless WordPress backend**,
with a brand-new design and **SEO as the core objective**. Later phases add custom
features (video consultation, booking).

**Primary goal:** analyze the **entire cardiology keyword landscape in Azerbaijani** and
rank the site for all relevant sector keywords — including **both proper-spelling and
ASCII-folded variants** (see §5, Azerbaijani transliteration). SEO is measured by keyword
coverage and ranking, not just clean markup.

---

## 2. Current site — audit findings (from live REST API)

**Detected stack:**
- Page builder: **Elementor Pro** + **Slider Revolution** + Elementor AI (heavy)
- SEO: **Yoast SEO**
- Cache: LiteSpeed · Security: Wordfence
- Analytics: **Google Site Kit** (GA4 + Search Console connected)
- Newsletter: **Mailchimp (MC4WP)**
- Booking: appointment-form plugin (SBR namespace)

**Content inventory:**
- **38 posts**, **6 pages**, **3 categories**, **524 media files**, 5 comments
- Categories: `blog` (19, patient-facing) · `həkimlər üçün / hekimler-ucun` (17, clinical) · `xəstəliklər / xestelikler` (4)
- Pages: Ana səhifə (Home) · Haqqımda (About) · Xidmətlərimiz (Services) · Bloq · Əlaqə (Contact) · Əlaqə formu (Appointment)

**URL structure (GOOD — preserve):**
- `/blog/{slug}/` · `/hekimler-ucun/{slug}/` · `/xestelikler/{slug}/`

**Notes / opportunities:**
- Some posts are in **English and German** — this is the **client's intentional choice**;
  NOT to be "fixed" or translated. Keep those titles/slugs as-is.
- Auto-generated (unoptimized) meta descriptions → optimize per post.
- Images missing alt text → add (only for used media, see §6).
- **Azerbaijani diacritics in URLs** (ə, ç, ş, ğ) → for NEW/optimized slugs use ASCII-folded
  form; existing slugs preserved unless client approves change (see §5).
- Existing typos in some slugs (e.g. `amilaidoz`) → change ONLY with client approval +
  301 redirect; not assumed.

---

## 3. Target architecture

```
CONTENT   →  Headless WordPress (existing content kept)
             Yoast + WPGraphQL (WPGraphQL SEO add-on) → API
FRONTEND  →  Next.js App Router — new design, SSR/SSG, full SEO
APP DATA  →  Supabase (Postgres): availability_slots + ephemeral appointments (auto-purged)
AUTH      →  patient: emailed confirm/cancel tokens · doctor: admin cookie (see §14.7)
VIDEO     →  LiveKit Cloud (embedded <VideoConference />) — no recording; self-host on VPS later
```

- WordPress **stays** as content backend → zero content-migration risk; client keeps familiar editor.
- Next.js owns design + SEO + custom features.

### 3.1 The WordPress move — DATA-LOSS WARNING (read before Phase 3)

Today `kardio.az` is a **single WordPress install** (WP 6.9.4, Elementor, `medilink` theme).
That one install is *both* the old Elementor front-end *and* the REST source of all 38 posts
— **they are the same thing on the same server.**

- ⚠️ **"Deleting the old site" = deleting the blog.** The old front-end cannot be removed
  independently; doing so destroys the posts and images the new site reads.
- **Approach (owner decision 2026-07-17): fresh install, not an SQL copy.** Export posts +
  images from the old site (WXR), stand up a clean WordPress on `cms.kardio.az` (Yoast +
  WPGraphQL only), import, recreate categories, apply ASCII slugs. Full order + the data-loss
  guardrails: [`migration/README.md`](./migration/README.md) and §6.
- The old install is **kept running** as the content source until the fresh one is verified
  serving all 38 posts; only then is the old front-end retired. Never deleted mid-migration.
- **Status: not started.** `cms.kardio.az` does not resolve yet (no subdomain, no DNS, no
  SSL). This is Phase-3 work.

### 3.2 Instant publish (webhook) — receiver built, sender pending

- ✅ **Built now:** `POST /api/revalidate` — secret-guarded (`REVALIDATE_SECRET`, constant-time
  compare), calls `revalidatePath("/", "layout")` so a WordPress edit refreshes the home page,
  blog/category lists, the post itself and the sitemap at once. Verified locally (401 without
  secret, 200 with). Floor is unchanged: 1-hour ISR still self-heals even if the webhook fails.
- ⏳ **Phase 3:** a WordPress plugin (e.g. WP Webhooks / a small `save_post` hook on
  `cms.kardio.az`) that POSTs to `https://kardio.az/api/revalidate` with the secret on publish.
  Needs the deployed site + the moved WordPress, so it cannot be wired until then.
- App data (bookings/consultations) lives in Supabase, **not** WordPress.
- **Data minimization (Phase 4):** no medical/health data is persisted. Consultation content
  (chat, shared files, video) is session-only; booking details are auto-deleted after the
  consultation completes. **Exception (owner decision, 2026-07-17):** the patient's *name,
  mobile, email + visit history* is retained in a `patients` directory so returning patients
  are recognisable and reachable. See §14.3.

---

## 4. Hosting & infrastructure (DECIDED)

- **Frontend (Next.js):** **Hostinger Node.js hosting**.
  - Build in **standalone mode**; point Hostinger's Node app at the server entry.
  - Watch shared-hosting memory/process limits; revisit VPS if traffic grows.
- **WordPress (headless CMS):** on a **subdomain** (e.g. `cms.kardio.az`), separate from the Node app.
- **Booking / video app (Phase 4):** on its **own subdomain** (e.g. `randevu.kardio.az`),
  linked from the main site; the doctor's **admin panel** lives here too.
  - **Runs on a VPS** (not shared hosting) so background jobs work: real cron for email
    reminders, PM2 process management, video-SDK webhooks, and pending-booking cleanup.
    (Supabase `pg_cron` is an alternative scheduler if we want to keep jobs off the VPS.)
- **App DB:** Supabase.
- **Analytics:** keep Google Search Console + GA4 (already connected via Site Kit).

---

## 5. SEO strategy (core priority)

**Technical (Next.js):**
- SSR/SSG → full HTML for crawlers
- Per-page Metadata API: title, meta description, canonical, Open Graph
- **Yoast → Next.js bridge** via WPGraphQL SEO (client keeps editing SEO in Yoast)
- Auto-generated sitemap.xml + robots.txt from WP content
- JSON-LD: **`MedicalWebPage`, `Physician`, `MedicalOrganization`, `BreadcrumbList`, `FAQPage`**
- Core Web Vitals: image optimization, minimal JS (vs current Elementor bloat)

**On-page / content:**
- Optimize meta (title/description) per post; add alt text to used images
- Internal linking / topic clusters (interlink `/hekimler-ucun/` posts)
- English/German posts kept as-is (client's choice)

**Sector keyword research (PRIMARY GOAL):**
- Build a **master cardiology keyword map (Azerbaijani)** covering the whole sector —
  symptoms, conditions, treatments, procedures, patient questions.
- Sources: keyword web research + **Google Search Console** real queries (Site Kit already
  connected) + competitor analysis.
- Map keywords → existing content; identify **content gaps** → new post briefs.
- Track ranking/coverage as the core SEO success metric.

**Azerbaijani transliteration / dual-spelling optimization (CRITICAL):**
- Azerbaijani special letters are frequently typed with ASCII substitutes:
  `ə→e, ü→u, ç→c, ş→s, ğ→g, ö→o, ı→i, İ→i`.
- Google does NOT reliably treat `ə`≈`e` etc. for Azerbaijani → we must target BOTH forms.
- **Doctor name:** optimize for `Kənan Əhmədov` AND `Kenan Ehmedov`
  (schema `Person.alternateName`, both used naturally on About page + bylines).
- **Keyword map:** every term listed in both proper and ASCII-folded form
  (e.g. `ürək xəstəliyi` + `urek xesteliyi`).
- **Slugs:** ASCII-folded (`urek-xesteliyi`) — matches typing, avoids `%`-encoding.
- **On-page:** visible copy in correct Azerbaijani; ASCII variants seeded naturally in
  alt text, FAQ phrasing, headings — no keyword stuffing.
- **On-site search:** diacritic-folding so `urek` matches `ürək`.

**E-E-A-T (medical YMYL — critical):**
- Prominent Dr. Əhmədov bio + credentials + `Physician` schema
- Source citations, review dates, medical disclaimers

**Ongoing help:** `seo-post-optimizer` skill (installed) + optional automated live SEO help (§8).

---

## 6. Content & URL migration (protect rankings)

> **Superseded by owner decision (2026-07-17): FRESH WordPress, not an SQL copy.**
> The old install carries Elementor + theme + plugin bloat unwanted headless, and the old
> Yoast data was not good enough to keep. New plan below. Artifacts + full order:
> [`migration/README.md`](./migration/README.md).

- **Fresh WordPress** on `cms.kardio.az` (Yoast + WPGraphQL only, no Elementor). Carry over
  **only posts + post images** from the old site (WXR export). Categories recreated by hand;
  Yoast rewritten from scratch.
- **Slugs → clean ASCII-folded** (`urek-xesteliyi`, not `urek-x%c9%99st…`) — this is the
  strategy in §5, and the fresh install is the moment to apply it.
- **301 redirect map: BUILT.** [`migration/301-redirects.json`](./migration/301-redirects.json)
  — 23 redirects (the AZ-slug posts; 15 are already ASCII), **0 collisions**, generated from
  the live REST API with the site's own `slugify()`. Category prefix is unchanged, only the
  slug. ⚠️ Not wired into `next.config.ts` yet — the new slugs don't exist until the fresh WP
  is populated; wiring early would 404 the site.
- **Category IDs will change** on a fresh install → update the hardcoded `27/26/61` map in
  `web/lib/content/wordpress.ts` (or refactor to slug-based lookup).
- **⚠️ Never delete the old install before the new one is verified serving all 38 posts.**
- Pre-launch: run the old-vs-new compare script; verify every old URL 301s. Post-launch:
  submit new sitemap to Search Console; monitor rankings/coverage.

**Media handling:**
- Do **NOT** migrate the full 524-item media library. Migrate **only media actually
  referenced** in the 38 published posts + 6 pages (extract used-media list by scanning
  each item's content). Orphaned uploads/duplicates/old thumbnails are dropped.
- **New / replacement media** will be provided by the owner via a **Google Drive link**
  (to be shared) — used for the redesign.

---

## 7. Design

- Brand-new custom design replacing Elementor. Clean, trustworthy, medical, mobile-first, fast.
- **Content editable via ACF fields** (client edits text/images; layout stays in code).
- Blog posts: full standard WordPress editor.

---

## 8. Live SEO help (roadmap)

- **Tier 1 (now):** owner optimizes posts via Claude Code + `seo-post-optimizer` skill (free).
- **Tier 2 (later):** publish → webhook → Claude API → SEO suggestions written into WordPress (client self-serve; ~cents/post).

---

## 9. Custom features (later phases)

- **Video consultation** (telemedicine, Phase 4) ✅ *built locally*: single-doctor,
  emailed-token auth, **LiveKit** video + chat + screen share + file transfer, email-only
  notifications, free MVP. No medical data persisted; patient contact details retained.
  **Full module spec in [§14](#14-phase-4--video-consultation-module-detailed).**
- **Appointment booking**: custom, replacing current form plugin (part of the §14 module).
- **Newsletter**: keep Mailchimp
- Optional (future): online payments

---

## 10. Phased roadmap (SEO-first order)

| Phase | Deliverable |
|---|---|
| **0. Setup** | Next.js scaffold + WPGraphQL + Yoast SEO bridge + Supabase; connect to WP content; Hostinger Node deploy pipeline |
| **0.5 Keyword research** | Master AZ cardiology keyword map (dual-spelling) + GSC query pull + content-gap list. Feeds all content decisions. |
| **1. Core pages** | New design: Home, About (Haqqımda), Services (Xidmətlərimiz), Contact — ACF-editable, dual-spelling optimized |
| **2. Blog + SEO engine** | Blog/post/category templates; full technical SEO; JSON-LD; sitemap/robots; per-post meta via Yoast bridge; ASCII slugs |
| **3. Migration & launch** | **Fresh WordPress on `cms.kardio.az`** (posts + images only; categories + Yoast redone — see §6 + `migration/`); ASCII slugs + 301 map (built: `migration/301-redirects.json`); update category-ID map in the frontend; deploy Next.js to `kardio.az`; content/SEO QA; go live; Search Console monitoring. **Old install stays as content source until fully verified — never deleted early.** Instant-publish webhook receiver built (`/api/revalidate`); WordPress-side sender is a Phase-3 step (§3.2). |
| **4. Features** ✅ *built locally* | Booking + video consultation — single-doctor, emailed-token auth, **LiveKit**, email notifications, free MVP. Patient contact details **are** retained (§14.3). Full spec: [§14](#14-phase-4--video-consultation-module-detailed) |
| **5. SEO growth** | Fill content gaps from keyword map; Tier-2 live SEO help; ongoing optimization & rank tracking. **Blocked:** the keyword map (0.5) doesn't exist — see §11.1 |

**Phases 0–3 = the SEO-first rebuild (do first). Phases 4–5 after launch.**

---

## 11. Open items / to confirm before/at build time

- [ ] Design direction / brand assets / reference sites
- [ ] Confirm WordPress subdomain name (`cms.kardio.az`?) and booking subdomain (`randevu.kardio.az`?)
- [ ] Supabase project setup (choose **EU region** for Phase 4)
- [ ] **Legal sign-off** before Phase 4 go-live: telemedicine + data-protection review (see §14.9)
- [ ] Phase 4 reminder scheduler: VPS cron vs Supabase `pg_cron` (minor — decide at build)
- [ ] _Deferred:_ online payments (yes/no + timing); WhatsApp notifications (after Meta business verification)

### 11.1 Phase 5 kickoff — ask on the next call (raised 2026-07-17)

Phase 5 (SEO growth) is blocked on these. **Note the dependency:** §10 lists Phase 5's first
deliverable as "fill content gaps *from keyword map*", but the keyword map is **Phase 0.5,
which was never built** — so Phase 5 cannot start properly until it exists.

- [ ] **Where do we start?** Three separate workstreams live under Phase 5:
  1. **Keyword map + content gaps** *(recommended — unblocks the other two)*: master AZ
     cardiology keyword map with dual-spelling, mapped against the 38 existing posts →
     prioritised gap list + post briefs. This is §5's stated **PRIMARY GOAL**.
  2. **Tier-2 live SEO help** (§8): publish → webhook → Claude API → SEO suggestions written
     into WordPress. Self-serve, ~cents/post. Caveat: optimises posts before we know which
     keywords matter.
  3. **Rank tracking**: baseline current kardio.az coverage. Needs GSC access; better done
     once the map exists so we track the right terms.
- [ ] **Google Search Console query export?** (Search Console → Performance → Queries →
      Export, last 12 months). The single most valuable input for the keyword map — it shows
      what people *actually type*, including ASCII-folded spellings. Site Kit is already
      connected (§5). Without it the map rests on domain research + competitor analysis.
      Offer to walk the owner through the export if needed.
- [ ] **Sequencing reality check:** Phase 5 is defined as post-launch, but **Phase 3
      (migration & launch) has not happened** — the rebuild is still local-only. Keyword map
      and content briefs are useful now and launch-independent; rank tracking of the *new*
      site is not possible until it ships. Confirm whether Phase 3 should come first.

## 12. Risks

- Ranking loss during migration → mitigated by URL preservation + 301 map + monitoring.
- Hostinger shared Node limits (memory/ISR/background jobs) → monitor; VPS fallback (Phase 4 already on VPS).
- Medical YMYL bar is high → E-E-A-T must be strong (author, citations, accuracy).
- Phase 4 legal exposure (telemedicine + health data) → mitigated by data minimization
  (session-based, no storage) + consent + disclaimer + legal review (see §14.9).

## 13. Security note

- A temporary `claude` admin account + password was shared during planning.
  **Action: change that password / remove the account.** ✅ **Done (2026-07-14).**

---

## 14. Phase 4 — Video Consultation Module (detailed)

> **Scope:** Custom telemedicine feature for a **single** cardiologist (Dr. Kənan Əhmədov).
> **Depends on:** Phases 0–3 complete (Next.js + headless WordPress + Supabase live).
> **Status:** Design phase. Next step: Supabase SQL schema + finalized API route list.

### 14.1 Overview

A patient-facing video consultation module. Patients authenticate with **email only**, book
into slots the doctor opened in advance, and join a browser-based room (video + chat + file
sharing). **MVP is free, session-based, and stores no medical data.** No multi-doctor or role
system is built.

### 14.2 Locked decisions (MVP)

| Area | Decision |
|---|---|
| **Doctor model** | Single doctor (Dr. Əhmədov). No multi-doctor / role system. |
| **Auth** | **No Supabase Auth in the build.** Patient identity is the emailed single-use `confirm_token` / `cancel_token`; the doctor is an admin cookie. See §14.7. |
| **Video** | **LiveKit Cloud** — `<VideoConference />` from `@livekit/components-react`, joined with a server-minted AccessToken (2h TTL). Room name derives from the appointment UUID, so it is unguessable. |
| **Consultation room** | Video + chat + screen share + file transfer, embedded in our page. Patient never leaves kardio.az — `consultationUrl()` never emits a provider URL. |
| **Self-hosting** | LiveKit is self-hostable on the VPS → media never leaves our server (removes the cross-border health-data transfer, §14.9). Not done yet. |
| **Recording** | **None** (saves storage; also reduces legal/consent burden). |
| **Payments** | **None in MVP.** Payment can be configured later (fields/flow added when decided). |
| **Booking** | Patient self-books; doctor opens 30-min availability slots in advance. |
| **Slot length** | **30 minutes**, 1 slot = 1 consultation (single doctor → no overlap allowed). |
| **Timezone** | **Azerbaijan time (UTC+4, no DST).** Store UTC, display AZT. |
| **Booking confirmation** | Email double opt-in: `pending` → `booked`. |
| **Cancellation** | Patient: unique single-use `cancel_token` link. Doctor: from admin panel. Either side → the other is emailed. |
| **Reschedule** | Supported (cancel + rebook, or reschedule token). |
| **Notifications** | **Email only in MVP.** WhatsApp deferred (see §14.8). |
| **Data retention** | **Session-based.** No health data stored; personal booking data auto-deleted after the consultation completes. |
| **Hosting** | VPS + own subdomain (`randevu.kardio.az`), incl. the doctor's admin panel (see §4). |

### 14.3 Data model (Supabase / Postgres)

Deliberately minimal — full SQL is the next deliverable.

- **`availability_slots`** (persistent, non-personal): `start_at`, `end_at` (UTC), `status`
  (`open` / `held` / `booked`). Constraint: **no overlapping open slots** for the single doctor.
- **`appointments`** (**ephemeral — auto-purged after completion**): slot ref, patient email,
  `full_name`, `phone`, `status` (`pending` / `booked` / `completed` / `cancelled` /
  `no_show`), `hold_expires_at`, `cancel_token` (unique, single-use), `video_room` ref,
  timestamps.
- **`patients`** (**persistent — owner decision, 2026-07-17**): `email` (unique, lower-cased),
  `full_name`, `phone` (normalised `+994XXXXXXXXX`), `first_seen`, `last_seen`, `visit_count`.
  Name/phone refresh on each visit (`coalesce`, never overwritten with null).
  Exists so a returning patient is recognisable —
  the appointment rows are purged, so this is the durable record of *who* has been seen and
  *how often*. Contains **no medical data**. Service-role only (RLS on, no policies).
  Supersedes the salted-hash `patient_fingerprints` design (migration `0003`).
  - Deletion right: `DELETE /api/admin/patients` erases a person from the directory.
  - Correction right: `PATCH /api/admin/patients` — the doctor can fix/add name + phone
    (same validation as the public form; empty clears). Email is **not** editable: it is the
    key appointments join on, so changing it would orphan the visit history.
  - Export: `GET /api/admin/patients/export` → CSV (`lib/booking/csv.ts`). Admin-only,
    `no-store`. **UTF-8 BOM + `sep=,`** or Excel mangles every ə/ü/ş and dumps rows into one
    column on AZ/TR/RU locales. Cells starting with `= + - @` are prefixed with `'`
    (**formula-injection guard** — patients type their own details, and an address like
    `=HYPERLINK(...)@mail.com` passes e-mail validation while executing on open).
    ⚠️ Operationally this file is the **entire patient dataset in one download** — treat it
    as such (no forwarding, no cloud drives).
  - ⚠️ Retaining contact data changes the compliance posture — the privacy policy, consent
    and disclaimer texts were updated to disclose it. Flag for the lawyer review (§14.9).
- **No medical notes.** No chat logs, no files, no recordings are stored — consultation
  content is session-only and never touches the database.
- **RLS:** `availability_slots` exposes only `status='open'` rows to `anon` (the public
  booking calendar). `appointments`, `patients` and `usage_stats` have **no grant to
  `anon`/`authenticated` at all** — every read/write goes through our server-side routes on
  the service-role key. The original "patient reads own appointment via `auth.uid()`" policy
  was dropped in migration `0005`: it was dead (no Supabase Auth ⇒ `auth.uid()` always null).
- **`usage_stats`** (non-personal): per-day counters (`booked` / `completed` / `cancelled` /
  `no_show`) that survive the purge, powering the admin dashboard.
- **Cleanup jobs:** (a) release `held` slots whose `hold_expires_at` passed → back to `open`;
  (b) after a consultation completes, purge the appointment row (the `patients` entry stays).

### 14.4 Booking flow (email double opt-in, also prevents double-booking)

```
open  →  held (patient grabs slot; hold_expires_at ≈ 15 min; confirmation email sent)
              ├─ patient confirms via email link  → booked
              └─ 15 min elapses, no confirm       → auto-released back to open
```

The `held` state is what stops two patients taking the same slot (race condition) and keeps
unconfirmed bookings from locking a slot forever.

### 14.5 API routes (indicative — to finalize)

**As built** (routes take ids in the JSON body, not the path, except the token route):

| Route | Verb | Notes |
|---|---|---|
| `/api/availability` | GET, POST | list open slots · doctor opens slots (admin) |
| `/api/appointments` | POST | patient holds a slot → confirmation email. Requires name + mobile + email + consent |
| `/api/appointments/confirm` | POST | email opt-in → `held` → `booked`, mints the room |
| `/api/appointments/cancel` | POST | `cancel_token` (patient) or `appointmentId` (doctor) |
| `/api/appointments/complete` | POST | ends the consultation |
| `/api/consultation/[id]/token` | POST | mints the LiveKit join token — **this is the access gate** (appointment `booked` + inside the join window) |
| `/api/admin/login` | POST | shared password → httpOnly cookie (**demo-grade**) |
| `/api/admin/appointments` | GET | all appointments |
| `/api/admin/appointments/accept` | POST | accept a pending booking without the email |
| `/api/admin/appointments/create` | POST | doctor books a phone-in patient directly (lands `booked`) |
| `/api/admin/stats` | GET | aggregate usage counters |
| `/api/admin/patients` | GET, PATCH, DELETE | directory · correct name/phone · erase |
| `/api/admin/patients/export` | GET | `.xlsx` (default) or `?format=csv` |

- Internal cron (`instrumentation.ts` → `lib/cron.ts`, node-cron): hold-expiry release +
  post-consultation purge. **Email reminders are not implemented.**
- **Not built:** `reschedule` (patient cancels + rebooks instead).

### 14.6 Consultation room

- Browser-based **LiveKit** room embedded in our page (`<VideoConference />`); chat + screen
  share built in. Patients never see a provider URL — `consultationUrl()` always points at
  `/konsultasiya/:id` on our own domain.
- **File sharing** over LiveKit byte streams (in-session only; nothing persisted). There is
  **no `/api/consultation/:id/files` endpoint** — an earlier draft of §14.5 named one; the
  transfer is peer-to-peer through the SDK and never touches our server.
- Access gated by appointment ownership + a short-lived room token. No recording.
- **Join window (`lib/booking/join-window.ts`):** the room opens **5 min before** the slot
  (`JOIN_EARLY_MINUTES`) and closes **30 min after it ends** (`JOIN_GRACE_MINUTES` + the
  30-min slot), so an overrunning or late call is never locked out. Applies to the **doctor
  too** — a stale tab cannot rejoin yesterday's room.
  - Enforced server-side in `POST /api/consultation/:id/token` (403 `early` / `expired`).
    The UI countdown is a courtesy; the token mint is the actual gate.
  - `ConsultationGate` shows a live countdown and flips into the room by itself — no reload.
    The patient can still cancel from that screen.

### 14.7 Auth (email only)

**As built — Supabase Auth was never used.** The flow needs no accounts, so none were added:

- **Patient:** identity is a single-use token emailed to them — `confirm_token` to complete
  the booking, `cancel_token` to cancel. Possession of the link *is* the proof. No password,
  no session, nothing to forget or leak. `appointments.patient_user_id` is a leftover of the
  Supabase-Auth design and is always null.
- **Doctor:** a shared `ADMIN_PASSWORD` → httpOnly cookie (`lib/admin-auth.ts`).
  ⚠️ **Demo-grade — replace before go-live** (one shared secret, no per-user audit trail,
  no rotation). Supabase Auth with an admin role is the intended production path.
- WhatsApp is **not** used for auth. No SMS, no phone OTP (the mobile we now collect is for
  the doctor to reach the patient, *not* an auth factor).

### 14.8 Notifications

- **MVP: email only** (transactional email provider — TBD), sent to both parties on
  confirm / cancel / reschedule (+ optional reminder via cron).
- **Deferred — WhatsApp:** utility templates are cheap (~$0.004–0.046/msg; a few $/month at our
  volume), but require a BSP (Twilio or Meta Cloud API), Meta **business verification**, and
  **approved templates** — long lead time. Add post-MVP; run verification in parallel so it
  never blocks launch.

### 14.9 Compliance (research findings — 2026-07)

- **Telemedicine (AZ):** no dedicated standalone law yet; the sector is under active development
  (Ministry of Health working group + a Cabinet-of-Ministers draft). Not prohibited. Mitigate
  with an **informed-consent checkbox**, a **medical disclaimer** ("online consultation does not
  replace an in-person examination"), and a **lawyer review before charging / go-live**.
- **Personal data (AZ "On Personal Data" law, 2010, amended):** health data is a **special
  category** requiring **explicit consent + a legal basis**; data-subject requests answered
  within 30 days; cross-border transfer and possible system-registration duties. Our
  **session-based / no-storage design keeps us largely out of health-data storage obligations.**
  Still required: consent checkbox at booking, a privacy policy, strict RLS, and **Supabase EU
  region**. Confirm with a local lawyer before go-live.

### 14.10 Open questions

1. Reminder scheduler location — VPS cron vs Supabase `pg_cron` (minor).
2. Exact subdomain name (`randevu.kardio.az`?).
3. When to enable **payments** and **WhatsApp** (both deferred, not in MVP).
4. Legal sign-off on §14.9 before go-live.

### 14.11 Next step

Write the **Supabase SQL schema** (`availability_slots`, `appointments` + RLS + cleanup) and
the **finalized API route list** with request/response shapes.

---

## 15. Legal & compliance documents (drafts)

Draft patient-facing legal content lives in [`legal/`](./legal/) — **Azerbaijani** (site language),
each marked **DRAFT / requires lawyer review** per §14.9. See [legal/00-README.md](./legal/00-README.md)
for the index and the `[DOLDURULMALI: …]` placeholders (legal entity, VÖEN, address, contacts,
effective date) to fill before publishing.

| Document | File | Where it appears |
|---|---|---|
| Informed consent (telemedicine) | [informed-consent-teletibb.md](./legal/informed-consent-teletibb.md) | Booking form (checkbox + full-text link) |
| Medical disclaimer | [tibbi-bildiris-disclaimer.md](./legal/tibbi-bildiris-disclaimer.md) | All medical pages, consultation room |
| Privacy policy (personal data) | [mexfilik-siyaseti.md](./legal/mexfilik-siyaseti.md) | Footer + booking form |
| Terms of use | [istifade-sertleri.md](./legal/istifade-sertleri.md) | Footer + booking form |
| Cookie policy | [kuki-siyaseti.md](./legal/kuki-siyaseti.md) | Footer + cookie banner |
| Booking & cancellation policy | [randevu-legvetme-siyaseti.md](./legal/randevu-legvetme-siyaseti.md) | Booking form |
| Consent checkbox microcopy | [booking-form-checkboxes.md](./legal/booking-form-checkboxes.md) | Booking form UI |

**Build notes:**
- Booking submit stays disabled until the 3 mandatory consent checkboxes are ticked (§14.4 flow).
- Consent text is anchored to a version; the "agreed" record is purged with the rest of the
  appointment data after the consultation (data minimization, §14.3).
- Footer links: Privacy · Terms · Cookies · Disclaimer. Cookie banner defaults to
  privacy-preserving (non-essential cookies off until accepted).
- **These are drafts, not legal advice — a qualified AZ lawyer must review before go-live.**
