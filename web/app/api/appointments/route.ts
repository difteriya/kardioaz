import { NextResponse } from "next/server";
import { holdSlot } from "@/lib/booking/service";
import { EMAIL_RE, normalizeName, normalizePhoneAz } from "@/lib/booking/validate";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    slotId?: string;
    email?: string;
    fullName?: string;
    phone?: string;
    consent?: boolean;
  };

  if (!body.slotId) {
    return NextResponse.json({ error: "Vaxt seçilməyib." }, { status: 400 });
  }
  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "Düzgün e-poçt daxil edin." }, { status: 400 });
  }

  const fullName = normalizeName(body.fullName ?? "");
  if (!fullName) {
    return NextResponse.json({ error: "Ad və soyadınızı daxil edin." }, { status: 400 });
  }

  const phone = normalizePhoneAz(body.phone ?? "");
  if (!phone) {
    return NextResponse.json(
      { error: "Düzgün mobil nömrə daxil edin. Məsələn: +994 50 123 45 67" },
      { status: 400 },
    );
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "Davam etmək üçün razılıq tələb olunur." },
      { status: 400 },
    );
  }

  const result = await holdSlot(body.slotId, {
    email: body.email.trim().toLowerCase(),
    fullName,
    phone,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
