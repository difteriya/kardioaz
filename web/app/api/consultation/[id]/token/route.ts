import { NextResponse } from "next/server";
import { getBookedAppointment } from "@/lib/booking/service";
import { isVideoConfigured, mintAccessToken, roomNameFor, LIVEKIT_URL } from "@/lib/video";
import { isAdmin } from "@/lib/admin-auth";
import { DOCTOR } from "@/lib/site";
import { joinWindow, JOIN_EARLY_MINUTES } from "@/lib/booking/join-window";

/**
 * Mint a short-lived LiveKit join token.
 *
 * The gate: the appointment must exist, still be `booked`, AND be inside its
 * join window (from 5 min before the slot until well after it). Without a token
 * the room cannot be joined at all, so this endpoint *is* the access control
 * (PROJECT-PLAN.md §14.6) — the countdown in the UI is only a courtesy, and the
 * window is enforced here where a patient cannot edit it away.
 *
 * The doctor is identified by the admin cookie and simply gets a different
 * display name — LiveKit has no moderator gate, so neither party waits for the
 * other. The time window applies to the doctor too, so a stale tab from
 * yesterday's call cannot silently rejoin a room.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isVideoConfigured()) {
    return NextResponse.json(
      { error: "Video xidməti konfiqurasiya edilməyib." },
      { status: 503 },
    );
  }

  const appt = await getBookedAppointment(id);
  if (!appt || (appt as { status: string }).status !== "booked") {
    return NextResponse.json({ error: "Konsultasiya tapılmadı." }, { status: 404 });
  }

  const startAt = (appt as unknown as { availability_slots: { start_at: string } })
    .availability_slots.start_at;
  const win = joinWindow(startAt);
  if (win.state !== "open") {
    return NextResponse.json(
      {
        error:
          win.state === "early"
            ? `Otaq randevudan ${JOIN_EARLY_MINUTES} dəqiqə əvvəl açılır.`
            : "Bu konsultasiyanın vaxtı bitib.",
        state: win.state,
        opensAt: new Date(win.opensAt).toISOString(),
      },
      { status: 403 },
    );
  }

  const doctor = await isAdmin();
  const roomName = roomNameFor(id);
  const token = await mintAccessToken({
    roomName,
    // unique per participant so two tabs don't evict each other
    identity: `${doctor ? "hekim" : "pasiyent"}-${crypto.randomUUID().slice(0, 8)}`,
    displayName: doctor ? DOCTOR.name : "Pasiyent",
  });

  if (!token) {
    return NextResponse.json({ error: "Otağa giriş alınmadı." }, { status: 502 });
  }
  return NextResponse.json({ token, url: LIVEKIT_URL, roomName });
}
