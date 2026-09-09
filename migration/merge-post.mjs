// Replace the body of an existing post with a merged version, and refresh its
// Yoast fields.
//
// Used when the doctor writes new material on a topic the site already covers.
// Publishing it as a second post would put two of his own pages in competition
// for the same query — the cannibalisation the /en/ and /de/ duplicates already
// cost us — so the new writing goes into the page that already ranks.
//
// The old body is saved to content-drafts/merged/<id>.before.html before the
// write, so a bad merge can be reverted without going through wp-admin
// revisions.
//
//   node migration/merge-post.mjs <spec.json> [--dry]
//   spec.json: { id, slug, htmlFile, yoastTitle?, yoastDesc?, focusKw?, excerpt? }
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
const spec = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), "utf8"));
const html = fs.readFileSync(path.resolve(spec.htmlFile), "utf8");

if (spec.yoastTitle && spec.yoastTitle.length > MAX_TITLE) throw new Error(`title ${spec.yoastTitle.length} > ${MAX_TITLE}`);
if (spec.yoastDesc && spec.yoastDesc.length > MAX_DESC) throw new Error(`desc ${spec.yoastDesc.length} > ${MAX_DESC}`);

const cur = await (await fetch(`${BASE}/posts/${spec.id}?context=edit`, { headers: { "X-WP-Auth": A } })).json();
if (cur.slug !== spec.slug) throw new Error(`slug mismatch — expected "${spec.slug}", found "${cur.slug}"`);

const before = cur.content?.raw ?? "";
const wordsBefore = before.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const wordsAfter = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

// Anything the old body linked or embedded that the merge dropped is worth
// knowing about before the write, not after.
const oldImgs = [...before.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
const lost = oldImgs.filter((u) => !html.includes(u));
if (lost.length) console.warn(`  ! images dropped by the merge:\n    ${lost.join("\n    ")}`);

console.log(`${spec.id} ${spec.slug}: ${wordsBefore} → ${wordsAfter} words`);
// Not process.exit() — on Windows that trips a libuv assertion while the fetch
// handle is still closing, which looks like a failure and sets a non-zero code.
if (DRY) {
  console.log("  (dry run, nothing written)");
} else {

fs.mkdirSync(path.resolve("content-drafts/merged"), { recursive: true });
fs.writeFileSync(path.resolve(`content-drafts/merged/${spec.id}.before.html`), before, "utf8");

const meta = {};
if (spec.yoastTitle) meta._yoast_wpseo_title = spec.yoastTitle;
if (spec.yoastDesc) meta._yoast_wpseo_metadesc = spec.yoastDesc;
if (spec.focusKw) meta._yoast_wpseo_focuskw = spec.focusKw;

const body = { content: html };
if (spec.excerpt) body.excerpt = spec.excerpt;
if (Object.keys(meta).length) body.meta = meta;

const r = await fetch(`${BASE}/posts/${spec.id}`, {
  method: "POST",
  headers: { "X-WP-Auth": A, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const j = await r.json();
if (!j.id) throw new Error("update failed: " + JSON.stringify(j).slice(0, 300));
console.log(`✓ updated — https://kardio.az/${spec.path}`);
}
