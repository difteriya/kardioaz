import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand cache purge for WordPress content.
 *
 * WordPress hits this when a post is published or edited (via a webhook plugin
 * on cms.kardio.az — that half is a Phase 3 setup step, see PROJECT-PLAN §8/§6).
 * Until then the site still self-heals hourly through time-based ISR; this route
 * only makes the update *instant*.
 *
 * Auth is a shared secret in the `x-revalidate-secret` header (or `?secret=`),
 * compared in constant time. The endpoint takes no content from the caller and
 * only ever purges our own cache, so a leaked secret is low-impact (at worst,
 * someone can force-refresh our pages) — but it still must not be guessable, or
 * it becomes a cheap way to hammer the WordPress origin.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // Fail closed: without a configured secret, refuse rather than purge freely.
    return NextResponse.json(
      { error: "REVALIDATE_SECRET is not configured." },
      { status: 503 },
    );
  }

  const provided =
    req.headers.get("x-revalidate-secret") ??
    new URL(req.url).searchParams.get("secret") ??
    "";

  if (!timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 401 });
  }

  // Purge every page under the root layout: a published post has to appear on
  // the home page, the blog + category lists, its own page, and the sitemap all
  // at once. In Next 16 revalidateTag is tied to the new "use cache" model;
  // revalidatePath reliably expires the classic fetch data cache we use.
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, scope: "layout" });
}
