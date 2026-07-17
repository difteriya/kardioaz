import { NextResponse } from "next/server";
import { listOpenSlots, createSlots } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  const slots = await listOpenSlots();
  return NextResponse.json({ slots });
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }
  const body = (await req.json()) as { starts?: string[] };
  if (!Array.isArray(body.starts) || body.starts.length === 0) {
    return NextResponse.json({ error: "Vaxt seçilməyib." }, { status: 400 });
  }
  const created = await createSlots(body.starts);
  return NextResponse.json({ created });
}
