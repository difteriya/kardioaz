# Migration artifacts (Phase 3)

Fresh-install migration of kardio.az blog content. **Owner decisions (2026-07-17):**

- **Fresh WordPress** on `cms.kardio.az` — not an SQL copy of the old install
  (old site carries Elementor + `medilink` theme + plugin bloat not needed headless).
- From the old site, carry over **only posts + post images**. Categories recreated by hand.
  Yoast reinstalled and rewritten from scratch (old meta was not good enough to keep).
- **Slugs → clean ASCII-folded**, with 301 redirects from the old percent-encoded URLs.

## `301-redirects.json`

Old → new URL map, generated from the live REST API using the site's own `slugify()`
(`web/lib/site.ts`). **23 redirects** (the AZ-slug posts); the other 15 posts are already
ASCII and need none. **0 slug collisions** — every old slug maps to a unique new one, verified
at generation time.

Only the slug changes; the category prefix (`/blog/`, `/hekimler-ucun/`, `/xestelikler/`) is
preserved, matching the existing WordPress permalink structure.

### ⚠️ Do NOT wire these into `next.config.ts` yet

The redirects point at the *new* ASCII slugs, which do not exist in content until the fresh
WordPress is populated. Adding them now would 404 the local site (content still lives at the
old slugs). Wire them only after the fresh WP with ASCII slugs is up and `WORDPRESS_API_URL`
points at `cms.kardio.az`.

## `wp-headless-guard.php` — CMS-only lockdown

Drop-in must-use plugin so `cms.kardio.az` behaves as a pure backend:

- Visiting `cms.kardio.az/` → the **admin login** (dashboard once logged in).
- Any front-end URL (post/page/category) → **301 to the same path on `kardio.az`**;
  "View Post" / "Visit Site" links in the admin already point at the live site.
- **REST (`/wp-json`) and GraphQL stay open** — the Next.js front-end depends on them.
  This exclusion is the critical part: if it breaks, the live site goes blank.
- **Fully de-indexed:** serves `robots.txt` = `Disallow: /` for the whole CMS, and sends
  `X-Robots-Tag: noindex, nofollow, noarchive` on every response. Two layers on top of the
  301s, so cms.kardio.az can never appear in Google.

Install: `wp-content/mu-plugins/wp-headless-guard.php` on cms.kardio.az (auto-loads).
⚠️ Untested until the server exists — run the verify checklist at the bottom of the file
before repointing `WORDPRESS_API_URL`. Needs CMS permalinks set to `/%category%/%postname%/`.

## Phase-3 migration order (must not delete old site early)

1. Old WP → **Tools ▸ Export ▸ All content** (WXR). Also export media.
2. Fresh WordPress on `cms.kardio.az` — install **only Yoast + WPGraphQL** (no Elementor).
3. Recreate the 3 categories; import posts; set featured images.
   - ⚠️ Frontend reads the post image from **Yoast `og:image`**, not native featured_media —
     Yoast auto-fills og:image from the featured image, so keep Yoast active and set each
     post's Featured Image.
4. Convert slugs to the ASCII forms in `301-redirects.json` (or bulk-edit before import).
5. **Update `web/lib/content/wordpress.ts`** — the fresh install assigns NEW category IDs;
   the hardcoded `27/26/61` map will be wrong. (Better: refactor to resolve category by slug
   so it never breaks on reinstall.)
6. Point `WORDPRESS_API_URL` at `cms.kardio.az`; run the old-vs-new compare script; confirm
   all 38 posts, slugs, categories and images match.
7. Wire `301-redirects.json` into `next.config.ts`.
8. Deploy Next.js to `kardio.az`.
9. **Only now** retire the old front-end. The WordPress install is never deleted — it lives on
   at `cms.kardio.az` as the content source.
