import { NextResponse } from "next/server";
import { confirmAppointment } from "@/lib/booking/service";

export async function POST(req: Request) {
  const { token } = (await req.json()) as { token?: string };
  if (!token) {
    return NextResponse.json({ error: "Keçid etibarsızdır." }, { status: 400 });
  }
  const result = await confirmAppointment(token);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }
  return NextResponse.json({ ok: true, appointmentId: result.appointmentId });
}
