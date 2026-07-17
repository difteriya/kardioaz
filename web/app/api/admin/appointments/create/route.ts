import { NextResponse } from "next/server";
import { createAppointmentAsDoctor } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";
import { EMAIL_RE, normalizeName, normalizePhoneAz } from "@/lib/booking/validate";

/**
 * Doctor creates a booking directly (patient phoned in). No email opt-in:
 * the doctor's action is the confirmation, so it lands as `booked`.
 *
 * Name and phone are optional here — unlike the public form — because the
 * doctor may only have caught one of them on the call. If supplied they must
 * still be valid, so the directory never fills with junk.
 */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }

  const body = (await req.json()) as {
    slotId?: string;
    email?: string;
    fullName?: string;
    phone?: string;
  };

  if (!body.slotId) {
    return NextResponse.json({ error: "Vaxt seçilməyib." }, { status: 400 });
  }
  if (!body.email || !EMAIL_RE.test(body.email)) {
    return NextResponse.json({ error: "Düzgün e-poçt daxil edin." }, { status: 400 });
  }

  let fullName: string | undefined;
  if (body.fullName?.trim()) {
    const n = normalizeName(body.fullName);
    if (!n) return NextResponse.json({ error: "Ad və soyad düzgün deyil." }, { status: 400 });
    fullName = n;
  }

  let phone: string | undefined;
  if (body.phone?.trim()) {
    const p = normalizePhoneAz(body.phone);
    if (!p) {
      return NextResponse.json(
        { error: "Mobil nömrə düzgün deyil. Məsələn: +994 50 123 45 67" },
        { status: 400 },
      );
    }
    phone = p;
  }

  const result = await createAppointmentAsDoctor(body.slotId, {
    email: body.email.trim().toLowerCase(),
    fullName,
    phone,
  });
  return result.ok
    ? NextResponse.json({ ok: true, appointmentId: result.appointmentId })
    : NextResponse.json({ error: result.reason }, { status: 409 });
}
