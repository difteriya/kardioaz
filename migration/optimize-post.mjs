// SEO-optimize a doctor-written WordPress post on cms.kardio.az.
//
// The division of labour: Dr. Kənan writes the medical content in wp-admin as a
// draft; this tool + Claude add the SEO layer without touching his prose.
//
//   node migration/optimize-post.mjs fetch <id|slug>
//     Pulls the post (raw content + current Yoast), writes the body text to a
//     file for analysis, and prints an ASCII slug suggestion + current SEO. You
//     then run the seo-post-optimizer on it to decide the values.
//
//   node migration/optimize-post.mjs apply <id> <spec.json>
//     spec.json: { slug?, yoastTitle, yoastDesc, focusKw }
//     Writes the Yoast fields (title/metadesc/focus keyword) and, if given, the
//     slug. Warns when changing the slug of an already-published post (needs a
//     301 old→new, since the live kardio.az URL would change).
import fs from "node:fs";
import path from "node:path";

const BASE = "https://cms.kardio.az/wp-json/wp/v2";

function auth() {
  const env = fs.readFileSync(path.resolve("web/.env.local"), "utf8");
  const val = (k) => {
    const l = env.split(/\r?\n/).find((x) => x.startsWith(k));
    return l ? l.slice(k.length).replace(/^\s*=?\s*/, "").replace(/^"|"$/g, "").trim() : null;
  };
  const pass = (val("WP_MIGRATE_APP_PASSWORD") || "").replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${val("WP_MIGRATE_USER")}:${pass}`).toString("base64");
}

// Azerbaijani → ASCII slug (matches the site's dual-spelling convention).
const FOLD = { ə: "e", ü: "u", ç: "c", ş: "s", ğ: "g", ö: "o", ı: "i" };
function slugify(s) {
  return [...s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")]
    .map((c) => FOLD[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const toText = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function resolveId(a, idOrSlug) {
  if (/^\d+$/.test(idOrSlug)) return idOrSlug;
  const r = await fetch(`${BASE}/posts?slug=${encodeURIComponent(idOrSlug)}&status=any&_fields=id`, {
    headers: { "X-WP-Auth": a },
  });
  const j = await r.json();
  if (!Array.isArray(j) || !j[0]) throw new Error("no post with slug " + idOrSlug);
  return j[0].id;
}

async function fetchCmd(a, idOrSlug) {
  const id = await resolveId(a, idOrSlug);
  const r = await fetch(`${BASE}/posts/${id}?context=edit`, { headers: { "X-WP-Auth": a } });
  const p = await r.json();
  const title = p.title?.raw ?? p.title?.rendered ?? "";
  const contentHtml = p.content?.raw ?? p.content?.rendered ?? "";
  const text = toText(contentHtml);
  const dir = "content-drafts";
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, `${p.slug || id}.fetched`);
  fs.writeFileSync(base + ".html", contentHtml);
  fs.writeFileSync(base + ".txt", text);
  console.log(JSON.stringify({
    id: p.id,
    status: p.status,
    title,
    slug: p.slug,
    suggestedSlug: slugify(title),
    excerpt: toText(p.excerpt?.raw ?? p.excerpt?.rendered ?? ""),
    categories: p.categories,
    wordCount: text.split(" ").length,
    currentYoast: {
      title: p.meta?._yoast_wpseo_title || "",
      metadesc: p.meta?._yoast_wpseo_metadesc || "",
      focuskw: p.meta?._yoast_wpseo_focuskw || "",
    },
    files: { html: base + ".html", text: base + ".txt" },
  }, null, 2));
}

async function applyCmd(a, id, specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  const cur = await (await fetch(`${BASE}/posts/${id}?context=edit&_fields=status,slug`, {
    headers: { "X-WP-Auth": a },
  })).json();

  if (spec.slug && spec.slug !== cur.slug && cur.status === "publish") {
    console.log(`⚠️  slug change on a PUBLISHED post (${cur.slug} → ${spec.slug}). Add a 301`);
    console.log(`   redirect ${cur.slug} → ${spec.slug} before applying, or the live URL 404s.`);
  }

  const body = {
    meta: {
      _yoast_wpseo_title: spec.yoastTitle || "",
      _yoast_wpseo_metadesc: spec.yoastDesc || "",
      _yoast_wpseo_focuskw: spec.focusKw || "",
    },
  };
  if (spec.slug) body.slug = spec.slug;

  const r = await fetch(`${BASE}/posts/${id}`, {
    method: "POST",
    headers: { "X-WP-Auth": a, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const p = await r.json();
  if (!p.id) throw new Error("apply failed: " + JSON.stringify(p).slice(0, 200));
  console.log(`✓ optimized post ${p.id} — slug: ${p.slug} | focus: ${p.meta?._yoast_wpseo_focuskw}`);
}

const [cmd, arg1, arg2] = process.argv.slice(2);
const a = auth();
(cmd === "fetch" ? fetchCmd(a, arg1) : cmd === "apply" ? applyCmd(a, arg1, arg2) : Promise.reject(new Error("usage: fetch <id|slug> | apply <id> <spec.json>")))
  .catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
