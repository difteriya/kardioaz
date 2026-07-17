import { NextResponse } from "next/server";
import { listPatients, deletePatient, updatePatient } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";
import { normalizeName, normalizePhoneAz } from "@/lib/booking/validate";

/** Patient directory. Admin-only — this is personal data. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }
  return NextResponse.json({ patients: await listPatients() });
}

/**
 * Correct a patient's name/phone from the panel.
 *
 * An empty string clears the field; anything else must pass the same validation
 * the public booking form uses, so a typo can be fixed but junk cannot be
 * introduced by hand.
 */
export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    fullName?: string;
    phone?: string;
  };
  if (!body.id) {
    return NextResponse.json({ error: "Pasiyent seçilməyib." }, { status: 400 });
  }

  let fullName: string | null = null;
  if (body.fullName?.trim()) {
    fullName = normalizeName(body.fullName);
    if (!fullName) {
      return NextResponse.json(
        { error: "Ad və soyad düzgün deyil (ən azı iki söz, yalnız hərflər)." },
        { status: 400 },
      );
    }
  }

  let phone: string | null = null;
  if (body.phone?.trim()) {
    phone = normalizePhoneAz(body.phone);
    if (!phone) {
      return NextResponse.json(
        { error: "Mobil nömrə düzgün deyil. Məsələn: +994 50 123 45 67" },
        { status: 400 },
      );
    }
  }

  const result = await updatePatient(body.id, { fullName, phone });
  return result.ok
    ? NextResponse.json({ ok: true, fullName, phone })
    : NextResponse.json({ error: "Yadda saxlanmadı." }, { status: 500 });
}

/** Erase a patient on request (data-subject deletion right). */
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Pasiyent seçilməyib." }, { status: 400 });
  }
  const result = await deletePatient(body.id);
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Silinmə alınmadı." }, { status: 500 });
}
