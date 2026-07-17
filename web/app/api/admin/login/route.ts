import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD təyin edilməyib (.env.local)." },
      { status: 500 },
    );
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Yanlış parol." }, { status: 401 });
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
