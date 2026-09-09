import { NextResponse, type NextRequest } from "next/server";
import redirectMap from "@/lib/redirect-map.json";

/**
 * 301s for the WordPress-era URLs.
 *
 * Next 16 renamed this file convention from `middleware` to `proxy`; the old
 * name still works but warns on every build.
 *
 * The old site published Azerbaijani letters straight into slugs
 * (`/blog/alkoqolun-urəyə-təsiri`) and mirrored every post under `/en/` and
 * `/de/` language prefixes. The rebuild uses ASCII-folded slugs and no prefix,
 * so all of those went 404 — while still ranking. Search Console showed 89 such
 * URLs holding 108 clicks and ~13k impressions in 44 days, including
 * `/de/hekimler-ucun/aorta-size/` sitting at position 1.2.
 *
 * `redirects()` in next.config.ts cannot express these: it mishandles non-ASCII
 * source paths, and the language-prefix rule is a transform, not a list.
 *
 * Two passes, in order:
 *  1. `redirect-map.json` — exact old→new pairs, generated from the Search
 *     Console page list intersected with the live sitemap, plus the old
 *     top-level WordPress pages (/about, /services, …). Regenerate it the same
 *     way when Search Console surfaces more stale URLs.
 *  2. A generic fallback for anything the map missed: drop a leading /en or /de,
 *     fold Azerbaijani letters to ASCII, lowercase. A URL that is already
 *     correct folds to itself and is left alone.
 */

const MAP = redirectMap as Record<string, string>;

/** PROJECT-PLAN §5. Must match `asciiFold()` in lib/site.ts. */
const FOLD: Record<string, string> = {
  ə: "e", Ə: "e", ü: "u", Ü: "u", ç: "c", Ç: "c", ş: "s", Ş: "s",
  ğ: "g", Ğ: "g", ö: "o", Ö: "o", ı: "i", İ: "i",
};

/** Old tag/category archives — the rebuild has no equivalent, so send them to the blog. */
const ARCHIVE_PREFIXES = ["/tag/", "/category/", "/doctors-cat/"];

function normalise(pathname: string): string {
  let p = pathname;
  try {
    p = decodeURIComponent(p);
  } catch {
    // A malformed escape sequence: leave it as-is rather than throwing on every request.
  }
  p = p.replace(/^\/(en|de)(?=\/|$)/, "");
  p = p.replace(/\/+$/, "");
  return p || "/";
}

function target(pathname: string): string | null {
  const p = normalise(pathname);
  if (p === "/") return pathname === "/" ? null : "/";

  const mapped = MAP[p];
  if (mapped) return mapped;

  if (ARCHIVE_PREFIXES.some((prefix) => p.startsWith(prefix))) return "/blog";

  const folded = p.replace(/[əƏüÜçÇşŞğĞöÖıİ]/g, (ch) => FOLD[ch] ?? ch).toLowerCase();
  // Only redirect when we actually changed something; otherwise this is a live
  // URL (or a genuine 404) and must be left for the router to handle.
  return folded === pathname ? null : folded;
}

export default function proxy(request: NextRequest) {
  const to = target(request.nextUrl.pathname);
  if (!to) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = to;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Everything except Next internals, the API, and files with an extension.
  matcher: ["/((?!_next/|api/|.*\\.[\\w]+$).*)"],
};
