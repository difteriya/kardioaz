import { NextResponse } from "next/server";
import { cancelByToken, cancelAppointment } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string; appointmentId?: string };

  // Doctor-initiated cancel (admin) by appointment id.
  if (body.appointmentId) {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
    }
    const r = await cancelAppointment({ appointmentId: body.appointmentId, byDoctor: true });
    return r.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: r.reason }, { status: 400 });
  }

  // Patient cancel via single-use token.
  if (!body.token) {
    return NextResponse.json({ error: "Keçid etibarsızdır." }, { status: 400 });
  }
  const result = await cancelByToken(body.token);
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.reason }, { status: 400 });
}
