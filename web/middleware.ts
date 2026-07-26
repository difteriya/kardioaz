import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import redirects from "./lib/redirects-301.json";

/**
 * Old-site → new-site 301s, handled here rather than in next.config's
 * redirects(): the old WordPress slugs contain Azerbaijani letters (ə/ü/ç/ş/ğ/
 * ö/ı) and the framework's redirects() matcher does not reliably match those
 * non-ASCII sources. In middleware we decode the incoming path ourselves and
 * look it up, so matching is deterministic. Preserves SEO for every already
 * indexed URL at cut-over (migration/README.md).
 */
const stripTrailing = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

const MAP = new Map<string, string>(
  (redirects as { source: string; destination: string }[]).map((r) => [
    stripTrailing(r.source),
    r.destination,
  ]),
);

export function middleware(req: NextRequest) {
  // nextUrl.pathname is percent-encoded on the wire for non-ASCII; decode it so
  // it matches the literal-letter keys in the map. Malformed input → skip.
  let path = req.nextUrl.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    return NextResponse.next();
  }

  const dest = MAP.get(stripTrailing(path));
  if (dest) {
    const url = req.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  // Only the three content sections that have old-slug redirects.
  matcher: ["/blog/:path*", "/hekimler-ucun/:path*", "/xestelikler/:path*"],
};
