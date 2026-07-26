# Plesk deployment — kardio.az

Target: **Plesk VPS** (`plesk.aznetwork.net`, 185.129.1.250). Three pieces:

| Piece | Where | Domain |
|---|---|---|
| WordPress (content) | Plesk native (PHP + MySQL) | `cms.kardio.az` |
| Next.js (site) | Plesk Node.js (Passenger) | `kardio.az` |
| App database | **Supabase Cloud** (not on Plesk) | — |

**Verified before writing this (2026-07-17):** Plesk server reachable, Let's Encrypt SSL
works, Node 22 available, and `output: "standalone"` produces a `server.js` that boots and
serves the whole site locally on a test port. The Passenger startup file is proven.

---

## A. App database — Supabase Cloud (do first)

Don't run Supabase on Plesk (it's a whole Docker stack). Use the managed cloud:

1. Create a Supabase Cloud project (**EU region**, PROJECT-PLAN §11).
2. Run the migrations `web/supabase/migrations/0001…0005` (SQL editor or CLI).
3. Optional: load `web/supabase/demo-data.sql` for a populated demo.
4. Note the **Project URL** and **service_role key** (Settings ▸ API) for the env vars.

## B. WordPress — cms.kardio.az

1. Plesk ▸ add subdomain **cms.kardio.az** ▸ issue **Let's Encrypt** SSL.
2. **WordPress Toolkit** ▸ install (creates the MySQL DB automatically).
3. Plugins: **Yoast SEO**, **WPGraphQL**, **Add WPGraphQL SEO**.
4. Import posts + images (WXR from the old site — see `migration/README.md`).
   - Set each post's **Featured Image** (the front-end reads the image from Yoast og:image).
5. Recreate the 3 categories; apply the ASCII slugs from `migration/301-redirects.json`.
6. Permalinks ▸ **Custom: `/%category%/%postname%/`**.
7. Drop `migration/wp-headless-guard.php` into `wp-content/mu-plugins/`
   (locks the CMS to admin-only, de-indexes it, keeps REST/GraphQL open).
8. Run the verify checklist at the bottom of that PHP file — **especially** that
   `cms.kardio.az/wp-json/wp/v2/posts` returns JSON and is NOT redirected.

## C. Next.js — kardio.az

### Build
On a machine with Node 22 (or via Plesk Git + the Node app's install/build hooks):
```bash
cd web
npm ci
npm run build           # produces .next/standalone/server.js
```
Standalone output does NOT include static assets — copy them next to the server:
```bash
cp -r .next/static  .next/standalone/.next/static
cp -r public        .next/standalone/public
```
Deploy the contents of `.next/standalone/` (server.js + node_modules + .next + public) as
the application root on Plesk. (A small `deploy.sh` doing build + the two copies is worth
adding.)

### Plesk Node.js app
- Plesk ▸ add domain **kardio.az** ▸ **Let's Encrypt** SSL.
- Node.js ▸ enable, **Node version 22**.
- **Application Root**: the folder holding `server.js` (the standalone output).
- **Application Startup File**: `server.js`.
- **Application Mode**: `production`.
- Passenger sets `PORT`/`HOSTNAME`; `server.js` reads them (verified).

### Environment variables (Plesk Node.js ▸ Custom environment variables)
```
NEXT_PUBLIC_APP_URL=https://kardio.az
WORDPRESS_API_URL=https://cms.kardio.az/wp-json/wp/v2
NEXT_PUBLIC_SUPABASE_URL=<supabase cloud url>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
NEXT_PUBLIC_LIVEKIT_URL=<livekit cloud wss url>
LIVEKIT_API_KEY=<...>
LIVEKIT_API_SECRET=<...>
SMTP_HOST=<...>  SMTP_PORT=<...>  SMTP_USER=<...>  SMTP_PASS=<...>  SMTP_FROM=<...>
DOCTOR_EMAIL=ahmadovkardio@gmail.com
ADMIN_PASSWORD=<STRONG value — not the demo one>
REVALIDATE_SECRET=<random secret>
STATS_SALT=<random secret>
```

## D. Background jobs — Plesk Scheduled Tasks (not in-process cron)

The app has `node-cron` jobs (release expired slot-holds, purge completed appointments) via
`instrumentation.ts`. On Passenger the app idles and gets stopped, which would freeze those
jobs. **Move them to Plesk ▸ Scheduled Tasks** hitting a secret-guarded endpoint instead.

> ⚠️ TODO (small code change, not yet done): expose the two jobs behind a secret-protected
> `/api/cron/*` route and guard the in-process node-cron so it doesn't double-run in prod.
> Then add Plesk cron entries (e.g. every 5 min) that `curl` those endpoints.

## E. Instant publish webhook (optional, after B + C are live)

`POST /api/revalidate` (built + tested) purges the Next.js cache on demand. Add a WordPress
webhook on cms.kardio.az that POSTs to `https://kardio.az/api/revalidate` with
`x-revalidate-secret: <REVALIDATE_SECRET>` on publish. Until then, content self-heals hourly.

---

## E.1 Update workflow (every new feature)

After pushing a change to GitHub, on the Plesk server:

```bash
cd ~/httpdocs/web
git pull
npm ci            # only if dependencies changed (package.json); skip otherwise
npm run build     # postbuild copies static + public + .env.local into standalone
```
Then Plesk ▸ **Restart App**.

- **`web/.env.local` is never deleted** — it's git-ignored, so `git pull` leaves it, and the
  build only reads it. Edit it directly on the server when secrets change.
- `.next/standalone/.env.local` IS wiped by each build, but `postbuild` re-copies it
  automatically (`scripts/copy-standalone.mjs`) — no manual `cp` step anymore.
- Changing a `NEXT_PUBLIC_*` value requires a rebuild (those are inlined at build time);
  server-only vars (service keys, SMTP, admin password) take effect on restart alone.

## F. Cut-over order (DNS is managed at HOSTINGER — nameservers point there)

All DNS records are edited in **Hostinger's DNS zone**, NOT in Plesk. Plesk's local DNS zone
is inert while the nameservers stay at Hostinger. Adding a domain in Plesk therefore never
affects the live site — only a Hostinger DNS record change does.

1. **cms.kardio.az first (zero risk to the live site):** add the subscription in Plesk, then
   at Hostinger add ONE record: `cms A 185.129.1.250`. This is a new subdomain — it does not
   touch the `kardio.az` root record. Now issue Let's Encrypt for cms.kardio.az and build
   WordPress (section B). The old kardio.az keeps serving from Hostinger the whole time.
2. Do C + D on Plesk while `kardio.az` DNS still points at the old host.
3. **Test kardio.az via IP without any DNS change:**
   `curl --resolve kardio.az:443:185.129.1.250 https://kardio.az/` — confirms Plesk serves the
   new site before you commit.
4. Verify all 38 posts, images, booking flow, admin panel.
5. Wire `migration/301-redirects.json` into `web/next.config.ts` (only now — the new ASCII
   slugs exist in WordPress at this point).
6. **~1 day before cut-over:** at Hostinger, lower the TTL on the `kardio.az` A record to
   ~300s so the switch (and any rollback) propagates fast.
7. **Cut-over — the one live-affecting step:** at Hostinger, change the `kardio.az` A record
   `185.77.97.200 → 185.129.1.250`. Instantly reversible: change it back and the old site
   returns within the TTL.
8. Issue Let's Encrypt for `kardio.az` on Plesk once it resolves there.
9. Submit the new sitemap to Search Console; watch rankings.
10. **Only after the new site is verified live** — retire the old front-end. WordPress is
    never deleted; it lives on at cms.kardio.az.

## G. Before go-live (security)
- `ADMIN_PASSWORD` → a strong value (the demo used `kardio-admin`).
- Set a real `STATS_SALT` (else patient fingerprints could be brute-forced).
- Legal sign-off: telemedicine + data protection (PROJECT-PLAN §14.9).
- Rotate the LiveKit key/secret if they were ever exposed.
