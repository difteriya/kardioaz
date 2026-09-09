// Fill Yoast title / meta description / focus keyword (and the excerpt) on posts
// that came across the migration with all three fields empty.
//
// Reads content-drafts/yoast-fill.json, keyed by post id. Content prose is never
// touched — this only writes the SEO layer. The slug in each entry is checked
// against the live post before writing, so an id that has been reused or
// reordered fails loudly instead of writing the wrong meta onto the wrong post.
//
//   node migration/yoast-fill.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const BASE = "https://cms.kardio.az/wp-json/wp/v2";
const DRY = process.argv.includes("--dry");
const MAX_TITLE = 60;
const MAX_DESC = 155;

function auth() {
  const env = fs.readFileSync(path.resolve("web/.env.local"), "utf8");
  const val = (k) => {
    const l = env.split(/\r?\n/).find((x) => x.startsWith(k));
    return l ? l.slice(k.length).replace(/^\s*=?\s*/, "").replace(/^"|"$/g, "").trim() : null;
  };
  const pass = (val("WP_MIGRATE_APP_PASSWORD") || "").replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${val("WP_MIGRATE_USER")}:${pass}`).toString("base64");
}

const A = auth();
const spec = JSON.parse(fs.readFileSync(path.resolve("content-drafts/yoast-fill.json"), "utf8"));

let overlong = 0;
for (const [id, s] of Object.entries(spec)) {
  if (id.startsWith("_")) continue;
  if (s.yoastTitle.length > MAX_TITLE) { console.error(`! ${id} title ${s.yoastTitle.length} > ${MAX_TITLE}`); overlong++; }
  if (s.yoastDesc.length > MAX_DESC) { console.error(`! ${id} desc ${s.yoastDesc.length} > ${MAX_DESC}`); overlong++; }
}
if (overlong) { console.error(`\n${overlong} field(s) over length — fix before applying.`); process.exit(1); }

for (const [id, s] of Object.entries(spec)) {
  if (id.startsWith("_")) continue;

  const cur = await (await fetch(`${BASE}/posts/${id}?context=edit`, { headers: { "X-WP-Auth": A } })).json();
  if (cur.slug !== s.slug) {
    console.error(`! ${id} slug mismatch — expected "${s.slug}", found "${cur.slug}". Skipped.`);
    continue;
  }

  if (DRY) {
    console.log(`~ ${id} ${s.slug}\n    T(${s.yoastTitle.length}) ${s.yoastTitle}\n    D(${s.yoastDesc.length}) ${s.yoastDesc}\n    kw: ${s.focusKw}`);
    continue;
  }

  const r = await fetch(`${BASE}/posts/${id}`, {
    method: "POST",
    headers: { "X-WP-Auth": A, "Content-Type": "application/json" },
    body: JSON.stringify({
      excerpt: s.excerpt,
      meta: {
        _yoast_wpseo_title: s.yoastTitle,
        _yoast_wpseo_metadesc: s.yoastDesc,
        _yoast_wpseo_focuskw: s.focusKw,
      },
    }),
  });
  const j = await r.json();
  if (!j.id) { console.error(`! ${id} failed: ${JSON.stringify(j).slice(0, 200)}`); continue; }
  const m = j.meta || {};
  const ok = m._yoast_wpseo_title && m._yoast_wpseo_metadesc && m._yoast_wpseo_focuskw;
  console.log(`${ok ? "✓" : "?"} ${id} ${s.slug}`);
}
