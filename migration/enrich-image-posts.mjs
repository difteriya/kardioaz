// Add real content to the six image-only posts in /hekimler-ucun.
//
// They were published as a journal infographic and nothing else: no text, no
// alt attributes, no Yoast fields. Search engines saw an empty page, and six
// empty pages in a 46-post sitemap is a site-wide quality signal, not just six
// weak URLs.
//
// This prepends an intro written per post (content-drafts/image-posts-content.json),
// fills every empty alt attribute in order, and writes the Yoast fields and the
// excerpt. Posts stay published — the images and their source links are
// untouched, so nothing the doctor put there is lost.
//
//   node migration/enrich-image-posts.mjs [--dry]
import fs from "node:fs";
import path from "node:path";

const BASE = "https://cms.kardio.az/wp-json/wp/v2";
const DRY = process.argv.includes("--dry");

function auth() {
  const env = fs.readFileSync(path.resolve("web/.env.local"), "utf8");
  const val = (k) => {
    const l = env.split(/\r?\n/).find((x) => x.startsWith(k));
    return l ? l.slice(k.length).replace(/^\s*=?\s*/, "").replace(/^"|"$/g, "").trim() : null;
  };
  const pass = (val("WP_MIGRATE_APP_PASSWORD") || "").replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${val("WP_MIGRATE_USER")}:${pass}`).toString("base64");
}

/** Fill alt="" on each <img> in document order from the supplied list. */
function applyAlts(html, alts) {
  let i = 0;
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const alt = alts[i++];
    if (!alt) return tag;
    return /\balt="[^"]*"/.test(tag)
      ? tag.replace(/\balt="[^"]*"/, `alt="${alt.replace(/"/g, "&quot;")}"`)
      : tag.replace(/<img\b/, `<img alt="${alt.replace(/"/g, "&quot;")}"`);
  });
}

const A = auth();
const spec = JSON.parse(fs.readFileSync(path.resolve("content-drafts/image-posts-content.json"), "utf8"));

for (const [id, s] of Object.entries(spec)) {
  if (id.startsWith("_")) continue;

  const cur = await (await fetch(`${BASE}/posts/${id}?context=edit`, { headers: { "X-WP-Auth": A } })).json();
  const raw = cur.content?.raw ?? "";

  if (raw.includes(s.intro.slice(0, 60))) {
    console.log(`= ${id} ${s.slug} — intro already present, skipping`);
    continue;
  }

  // Gutenberg needs its own comment delimiters or the editor shows the block as
  // "unexpected content"; wrapping the intro in a single html block keeps the
  // markup intact and the post editable.
  const block = `<!-- wp:html -->\n${s.intro}<!-- /wp:html -->\n\n`;
  const content = block + applyAlts(raw, s.alts);

  const body = {
    content,
    excerpt: s.excerpt,
    meta: {
      _yoast_wpseo_title: s.yoastTitle,
      _yoast_wpseo_metadesc: s.yoastDesc,
      _yoast_wpseo_focuskw: s.focusKw,
    },
  };

  if (DRY) {
    console.log(`~ ${id} ${s.slug}\n    +${s.intro.length} chars, ${s.alts.length} alts, yoast ${s.yoastTitle.length}/${s.yoastDesc.length}`);
    continue;
  }

  const r = await fetch(`${BASE}/posts/${id}`, {
    method: "POST",
    headers: { "X-WP-Auth": A, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.id) {
    console.error(`! ${id} failed: ${JSON.stringify(j).slice(0, 200)}`);
    continue;
  }
  const words = (j.content?.rendered ?? "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  console.log(`✓ ${id} ${s.slug} — now ${words} words | yoast title/desc/kw set`);
}
