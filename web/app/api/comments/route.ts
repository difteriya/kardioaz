import { NextResponse } from "next/server";
import { submitComment } from "@/lib/comments";

/**
 * Comment submission with layered spam protection. The strongest layer is that
 * every comment is held for moderation (in lib/comments) — these checks just
 * keep bot noise out of the queue:
 *   1. honeypot   — a hidden field only a bot fills,
 *   2. timing     — humans don't submit within 2s of the page loading,
 *   3. rate limit — per-IP throttle,
 *   4. validation — required fields + sane lengths.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-IP throttle. In-memory is fine here: a single Node process on the VPS, and
// moderation catches anything that slips through a restart.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 5;
const MIN_GAP_MS = 30 * 1000; // 30s between comments

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  if (recent.length && now - recent[recent.length - 1] < MIN_GAP_MS) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    postId?: number;
    name?: string;
    email?: string;
    content?: string;
    website?: string; // honeypot — must stay empty
    renderedAt?: number; // ms timestamp when the form mounted
  };

  // 1. Honeypot — pretend success so the bot doesn't learn it was caught.
  if (body.website) return NextResponse.json({ ok: true, pending: true });

  // 2. Timing — a real person can't fill and submit in under 2 seconds.
  if (typeof body.renderedAt === "number" && Date.now() - body.renderedAt < 2000) {
    return NextResponse.json({ ok: true, pending: true });
  }

  // 3. Rate limit.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Çox tez-tez göndərilir. Bir az sonra yenidən cəhd edin." },
      { status: 429 },
    );
  }

  // 4. Validation.
  if (!body.postId || typeof body.postId !== "number") {
    return NextResponse.json({ error: "Yazı tapılmadı." }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const content = (body.content ?? "").trim();
  if (name.length < 2 || name.length > 50) {
    return NextResponse.json({ error: "Adınızı düzgün yazın." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Düzgün e-poçt daxil edin." }, { status: 400 });
  }
  if (content.length < 5 || content.length > 2000) {
    return NextResponse.json(
      { error: "Şərh 5–2000 simvol aralığında olmalıdır." },
      { status: 400 },
    );
  }
  // Cheap link-spam heuristic: comments stuffed with URLs are almost always spam.
  if ((content.match(/https?:\/\//gi) || []).length > 2) {
    return NextResponse.json({ ok: true, pending: true }); // silently drop
  }

  const result = await submitComment({ postId: body.postId, name, email, content });
  return result.ok
    ? NextResponse.json({ ok: true, pending: true })
    : NextResponse.json({ error: result.reason }, { status: 502 });
}
