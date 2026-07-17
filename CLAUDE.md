# kardio.az — Project Context

> Read **[PROJECT-PLAN.md](./PROJECT-PLAN.md)** for the full blueprint. This file is the
> quick-start context loaded at the top of every session.

## What this is
Rebuild of **kardio.az** — a solo cardiologist site (Dr. Kənan Əhmədov, *"Sizin ürək
həkiminiz"*) — from WordPress/Elementor into a **custom Next.js frontend on a headless
WordPress backend**. Brand-new design. **SEO is the #1 goal.**

## Locked decisions
- **Stack:** headless WordPress (content) + Next.js App Router (frontend) + Supabase (app data) + video SDK later.
- **Hosting:** Hostinger **Node.js** hosting for Next.js; WordPress on a subdomain (e.g. `cms.kardio.az`).
- **Language:** Azerbaijani only. English/German posts exist and are **intentional (client's choice)** — do not "fix" them.
- **Priority order:** SEO-first rebuild (Phases 0–3), then features (video consultation, booking).

## SEO must-knows (core of the project)
- **Primary goal:** rank for the whole AZ cardiology keyword sector (keyword map + Google Search Console data + gap analysis).
- **Azerbaijani dual-spelling (CRITICAL):** target BOTH proper and ASCII-folded forms
  (`ə→e, ü→u, ç→c, ş→s, ğ→g, ö→o, ı→i`). e.g. optimize for **Kənan Əhmədov AND Kenan Ehmedov**,
  `ürək xəstəliyi` AND `urek xesteliyi`. New slugs = ASCII-folded.
- **Yoast → Next.js** via WPGraphQL SEO. `MedicalWebPage`/`Physician` schema. E-E-A-T matters (medical YMYL).
- Preserve existing URLs (`/blog/`, `/hekimler-ucun/`, `/xestelikler/`); 301 only with client approval.

## Content / media
- 38 posts, 6 pages, 3 categories. Migrate **only used media** (not the full 524-item library).
- New media provided by owner via a **Google Drive link** (to be shared).

## Project skill
- `.claude/skills/seo-post-optimizer` — per-post SEO optimizer (auto-applies AZ dual-spelling).
  Loads only when Claude Code is launched with **kardioaz as the project root**.

## Status (updated 2026-07-17)
**Phases 0–2 + 4 are BUILT AND RUNNING LOCALLY** in `web/` — not deployed anywhere.
- Full public site (Home, Haqqımda, Xidmətlər, Bloq + categories, Əlaqə, legal pages),
  real content pulled from the live `kardio.az` WP REST API.
- **Phase 4 works end-to-end locally:** slot → book → email double opt-in → confirm →
  video room → cancel/complete. Local Supabase (Docker) + Mailpit + **LiveKit** (not Daily,
  not Jitsi — both rejected; see §14.6).
- Admin panel (`/admin`, tabbed): usage stats, patient directory (edit/delete/export
  xlsx+CSV), doctor-created bookings, slot calendar, accept/decline.

**⏭ Not done:** Phase 0.5 (keyword research), Phase 3 (migration & launch — nothing is
deployed, no VPS/Hostinger setup), Phase 5.

**⚠ Two decisions reversed by the owner (2026-07-17)** — the "we store nothing" posture is
gone. We now retain patient **name + mobile + email + visit history** indefinitely in a
`patients` table (still **no medical data**; consultation content is never persisted).
Privacy policy, consent and disclaimer were rewritten to match — **do not "restore" the old
no-storage wording**. See PROJECT-PLAN §14.3.

## ⏸ Phase 5 — waiting on owner (ask on the next call)
Owner asked to start Phase 5, then deferred the scoping questions to a call.
**Full question list: PROJECT-PLAN.md §11.1.** Short version:
1. Start with **keyword map + content gaps** (recommended), **Tier-2 automation**, or
   **rank tracking**?
2. Can the owner export **Search Console → Performance → Queries** (12 months)?
3. Phase 5 is post-launch by definition but **Phase 3 never happened** — does launch come
   first?

## TODO / reminders
- ✅ Security: temporary `claude` WP admin account removed (2026-07-14).
- ✅ Google Drive media received (2026-07-17): 5 folders / 80 photos. 8 selected into
  `web/public/images/` and wired across Home, Haqqımda, Xidmətlər, Randevu, og:image and
  `Physician` schema. Source manifest: `web/.drive-manifest.json`.
  **⚠️ Folders B and D contain identifiable patients — none used. Publishing those needs the
  patients' written consent (legal/00-README.md).**
- Before go-live: `ADMIN_PASSWORD` shared-secret auth is **demo-grade** → real accounts;
  set a secret `STATS_SALT`; the patient export is the whole dataset in one file.
- Test data still in the local DB (~329 slots, `@kardio.az`/`@example.com` bookings) —
  offered to clear it for a clean client demo; owner hasn't said yes.
- Phase 4 before go-live: legal sign-off (telemedicine + data protection) — PROJECT-PLAN §14.9.
- Draft legal docs (AZ) live in `legal/` — consent, disclaimer, privacy, terms, cookies,
  booking policy, form checkboxes. All **DRAFT, need lawyer review** (PROJECT-PLAN §15).
