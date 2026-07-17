import { NextResponse } from "next/server";
import { acceptAppointment } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }
  const { appointmentId } = (await req.json()) as { appointmentId?: string };
  if (!appointmentId) {
    return NextResponse.json({ error: "Randevu seçilməyib." }, { status: 400 });
  }
  const result = await acceptAppointment(appointmentId);
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: result.reason }, { status: 400 });
}
