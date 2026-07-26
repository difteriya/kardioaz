// Reusable WordPress draft publisher for kardio.az content-gap posts.
// Reads Application Password creds from web/.env.local, authenticates via the
// X-WP-Auth header (this server strips Authorization — see wp-rest-auth-fix.php),
// optionally uploads a featured image, and creates the post as DRAFT so the
// doctor reviews it in wp-admin before it goes live (YMYL).
//
// Usage: node migration/publish-post.mjs <spec.json>
//   spec.json: { title, slug, categorySlug, excerpt, htmlFile, imageFile?, imageAlt? }
import fs from "node:fs";
import path from "node:path";

const CAT = { blog: 2, "hekimler-ucun": 3, xestelikler: 4 };
const BASE = "https://cms.kardio.az/wp-json/wp/v2";

function creds() {
  const env = fs.readFileSync(path.resolve("web/.env.local"), "utf8");
  const val = (k) => {
    const l = env.split(/\r?\n/).find((x) => x.startsWith(k));
    return l ? l.slice(k.length).replace(/^\s*=?\s*/, "").replace(/^"|"$/g, "").trim() : null;
  };
  const user = val("WP_MIGRATE_USER");
  const pass = (val("WP_MIGRATE_APP_PASSWORD") || "").replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

async function uploadMedia(auth, file, alt) {
  const buf = fs.readFileSync(file);
  const name = path.basename(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const type = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
  const r = await fetch(`${BASE}/media`, {
    method: "POST",
    headers: {
      "X-WP-Auth": auth,
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`,
    },
    body: buf,
  });
  const j = await r.json();
  if (!j.id) throw new Error("media upload failed: " + JSON.stringify(j).slice(0, 200));
  if (alt) {
    await fetch(`${BASE}/media/${j.id}`, {
      method: "POST",
      headers: { "X-WP-Auth": auth, "Content-Type": "application/json" },
      body: JSON.stringify({ alt_text: alt }),
    });
  }
  return j.id;
}

async function main() {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const auth = creds();
  const content = fs.readFileSync(path.resolve(spec.htmlFile), "utf8");

  let featured;
  if (spec.imageFile) {
    featured = await uploadMedia(auth, path.resolve(spec.imageFile), spec.imageAlt);
    console.log("featured media id:", featured);
  }

  const body = {
    title: spec.title,
    slug: spec.slug,
    status: "draft",
    content,
    excerpt: spec.excerpt || "",
    categories: [CAT[spec.categorySlug]],
    // Yoast SEO fields, writable via REST meta (verified). Fall back to the
    // post title / excerpt so the frontend's yoast_head_json is always filled.
    meta: {
      _yoast_wpseo_title: spec.yoastTitle || spec.title,
      _yoast_wpseo_metadesc: spec.yoastDesc || spec.excerpt || "",
      _yoast_wpseo_focuskw: spec.focusKw || "",
    },
  };
  if (featured) body.featured_media = featured;

  const r = await fetch(`${BASE}/posts`, {
    method: "POST",
    headers: { "X-WP-Auth": auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!j.id) throw new Error("post failed: " + JSON.stringify(j).slice(0, 300));
  console.log("✓ draft created — id:", j.id, "| slug:", j.slug, "| status:", j.status);

  // Did inline SVG survive WordPress KSES sanitisation?
  const chk = await fetch(`${BASE}/posts/${j.id}?context=edit`, { headers: { "X-WP-Auth": auth } });
  const cj = await chk.json();
  const html = cj.content?.raw ?? cj.content?.rendered ?? "";
  console.log("inline <svg> survived:", html.includes("<svg"));
  console.log("edit in wp-admin: https://cms.kardio.az/wp-admin/post.php?post=" + j.id + "&action=edit");
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
