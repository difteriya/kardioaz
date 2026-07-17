import { NextResponse } from "next/server";
import { completeAppointment } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";

/**
 * End a consultation. Patient ends it with their cancel token; the doctor ends
 * it from the admin session. Sets status=completed, which schedules the purge.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { token?: string; appointmentId?: string };

  if (body.appointmentId) {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
    }
    const r = await completeAppointment({ appointmentId: body.appointmentId });
    return r.ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: r.reason }, { status: 400 });
  }

  if (!body.token) {
    return NextResponse.json({ error: "Keçid etibarsızdır." }, { status: 400 });
  }
  const result = await completeAppointment({ cancelToken: body.token });
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.reason }, { status: 400 });
}
