import "server-only";
import { cookies } from "next/headers";

/**
 * Demo-grade admin auth for the single doctor: a shared password (ADMIN_PASSWORD)
 * exchanged for an httpOnly cookie. For production this should move to Supabase
 * Auth with an admin role (PROJECT-PLAN.md §14.2 / §14.10).
 */
const COOKIE = "kardio_admin";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  return !!val && !!process.env.ADMIN_PASSWORD && val === process.env.ADMIN_PASSWORD;
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, process.env.ADMIN_PASSWORD ?? "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
