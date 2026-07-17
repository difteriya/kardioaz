import { NextResponse } from "next/server";
import { getUsageStats } from "@/lib/booking/service";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "İcazə yoxdur." }, { status: 401 });
  }
  const stats = await getUsageStats();
  return NextResponse.json({ stats });
}
