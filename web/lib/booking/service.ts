import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { HOLD_MINUTES, SLOT_MINUTES, CONSENT_VERSION } from "./config";
import type { AvailabilitySlot, Appointment } from "./types";
import {
  sendBookingConfirmationRequest,
  sendBookingConfirmed,
  sendCancelled,
  sendDoctorBookingNotice,
  sendDoctorCancelledNotice,
} from "@/lib/email";
import { mintRoom } from "@/lib/video";

/**
 * The consultation link we send to patients is ALWAYS our own page — it embeds
 * the video room. We never hand out a raw video-provider URL, so the patient
 * stays on kardio.az and the server-side gate always applies (§14.6).
 */
function consultationUrl(appointmentId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/konsultasiya/${appointmentId}`;
}

/** Who the patient is — captured at booking. */
export interface PatientDetails {
  email: string;
  fullName: string;
  phone: string;
}

/** Counters are best-effort: statistics must never break a booking. */
async function bump(
  kind: "booked" | "completed" | "cancelled" | "no_show",
  patient?: { email: string; fullName?: string | null; phone?: string | null },
) {
  try {
    const db = createAdminClient();
    await db.rpc("bump_usage", { kind });
    if (patient) {
      await db.rpc("bump_patient_email", {
        p_email: patient.email,
        p_name: patient.fullName ?? null,
        p_phone: patient.phone ?? null,
      });
    }
  } catch (e) {
    console.error("[stats] bump failed:", (e as Error).message);
  }
}

/** List future open slots (public booking view). */
export async function listOpenSlots(): Promise<AvailabilitySlot[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("availability_slots")
    .select("*")
    .eq("status", "open")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Doctor opens one or more 30-min slots (admin). Ignores overlaps. */
export async function createSlots(startIsos: string[]): Promise<number> {
  const db = createAdminClient();
  let created = 0;
  for (const start of startIsos) {
    const startAt = new Date(start);
    const endAt = new Date(startAt.getTime() + SLOT_MINUTES * 60_000);
    const { error } = await db.from("availability_slots").insert({
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    });
    // Overlap / duplicate → skip (exclusion constraint). Other errors bubble.
    if (!error) created += 1;
    else if (!/exclu|overlap|duplicate|unique/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
  return created;
}

/**
 * Patient holds a slot: slot open→held, create a pending appointment with a
 * hold expiry, and email the confirmation link. Atomic-ish: the slot flip is
 * conditional on it still being open, which prevents double-booking.
 */
export async function holdSlot(
  slotId: string,
  patient: PatientDetails,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { email, fullName, phone } = patient;
  const db = createAdminClient();

  // Flip open → held only if still open (guards the race).
  const { data: slot, error: slotErr } = await db
    .from("availability_slots")
    .update({ status: "held" })
    .eq("id", slotId)
    .eq("status", "open")
    .select("start_at")
    .maybeSingle();
  if (slotErr) return { ok: false, reason: slotErr.message };
  if (!slot) return { ok: false, reason: "Bu vaxt artıq tutulub." };

  const holdExpires = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();
  const { data: appt, error: apptErr } = await db
    .from("appointments")
    .insert({
      slot_id: slotId,
      patient_email: email,
      full_name: fullName,
      phone,
      status: "pending",
      hold_expires_at: holdExpires,
      consent_version: CONSENT_VERSION,
    })
    .select("confirm_token")
    .single();

  if (apptErr || !appt) {
    // roll the slot back to open
    await db.from("availability_slots").update({ status: "open" }).eq("id", slotId);
    return { ok: false, reason: apptErr?.message ?? "Xəta baş verdi." };
  }

  await sendBookingConfirmationRequest(email, slot.start_at, appt.confirm_token);
  return { ok: true };
}

/** Confirm via email token: pending→booked, slot held→booked, mint room, email. */
export async function confirmAppointment(
  token: string,
): Promise<{ ok: true; appointmentId: string } | { ok: false; reason: string }> {
  const db = createAdminClient();
  const { data: appt } = await db
    .from("appointments")
    .select("*, availability_slots(start_at)")
    .eq("confirm_token", token)
    .maybeSingle();

  if (!appt) return { ok: false, reason: "Keçid etibarsızdır." };
  if (appt.status === "booked")
    return { ok: true, appointmentId: appt.id as string };
  if (appt.status !== "pending")
    return { ok: false, reason: "Bu randevu artıq aktiv deyil." };
  if (appt.hold_expires_at && new Date(appt.hold_expires_at) < new Date())
    return { ok: false, reason: "Təsdiq müddəti bitib. Yenidən cəhd edin." };

  const room = await mintRoom(appt.id as string);
  await db
    .from("appointments")
    .update({ status: "booked", video_room: room, notified_booked: true })
    .eq("id", appt.id);
  await db
    .from("availability_slots")
    .update({ status: "booked" })
    .eq("id", appt.slot_id);

  const startAt = (appt as unknown as { availability_slots: { start_at: string } })
    .availability_slots.start_at;
  await bump("booked", {
    email: appt.patient_email,
    fullName: appt.full_name,
    phone: appt.phone,
  });

  // Notify both parties (PROJECT-PLAN §14.8).
  await Promise.all([
    sendBookingConfirmed(
      appt.patient_email,
      startAt,
      consultationUrl(appt.id as string),
      appt.cancel_token,
    ),
    sendDoctorBookingNotice(
      startAt,
      appt.patient_email,
      consultationUrl(appt.id as string),
    ),
  ]);
  return { ok: true, appointmentId: appt.id as string };
}

/**
 * Doctor accepts a pending appointment (admin) — approves it without waiting for
 * the patient's email opt-in. Mints the room and emails the confirmation.
 */
export async function acceptAppointment(
  appointmentId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createAdminClient();
  const { data: appt } = await db
    .from("appointments")
    .select("*, availability_slots(start_at)")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!appt) return { ok: false, reason: "Randevu tapılmadı." };
  if (appt.status === "booked") return { ok: true };
  if (appt.status !== "pending")
    return { ok: false, reason: "Bu randevu qəbul edilə bilməz." };

  const room = await mintRoom(appt.id as string);
  await db
    .from("appointments")
    .update({
      status: "booked",
      video_room: room,
      notified_booked: true,
      hold_expires_at: null,
    })
    .eq("id", appt.id);
  await db.from("availability_slots").update({ status: "booked" }).eq("id", appt.slot_id);

  const startAt = (appt as unknown as { availability_slots: { start_at: string } })
    .availability_slots.start_at;
  await bump("booked", {
    email: appt.patient_email,
    fullName: appt.full_name,
    phone: appt.phone,
  });

  // Notify both parties (PROJECT-PLAN §14.8).
  await Promise.all([
    sendBookingConfirmed(
      appt.patient_email,
      startAt,
      consultationUrl(appt.id as string),
      appt.cancel_token,
    ),
    sendDoctorBookingNotice(
      startAt,
      appt.patient_email,
      consultationUrl(appt.id as string),
    ),
  ]);
  return { ok: true };
}

/**
 * Mark a consultation finished. Either party may end it: the patient holds the
 * cancel token, the doctor acts as admin.
 *
 * This is what starts the data-minimization clock — `purge_completed_appointments()`
 * deletes the row (and the patient's email with it) an hour later (§14.3). The
 * slot is NOT reopened: that time was actually used.
 */
export async function completeAppointment(opts: {
  cancelToken?: string;
  appointmentId?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createAdminClient();
  let q = db.from("appointments").select("id, status");
  q = opts.cancelToken
    ? q.eq("cancel_token", opts.cancelToken)
    : q.eq("id", opts.appointmentId!);
  const { data: appt } = await q.maybeSingle();

  if (!appt) return { ok: false, reason: "Randevu tapılmadı." };
  if (appt.status === "completed") return { ok: true };
  if (appt.status !== "booked")
    return { ok: false, reason: "Bu randevu tamamlana bilməz." };

  await db
    .from("appointments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", appt.id);
  await bump("completed");
  return { ok: true };
}

/** Cancel via single-use cancel token (patient) — frees the slot. */
export async function cancelByToken(
  token: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  return cancelAppointment({ cancelToken: token });
}

/** Cancel an appointment (by cancel token or by id for the doctor). */
export async function cancelAppointment(opts: {
  cancelToken?: string;
  appointmentId?: string;
  byDoctor?: boolean;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = createAdminClient();
  let q = db.from("appointments").select("*, availability_slots(start_at)");
  q = opts.cancelToken
    ? q.eq("cancel_token", opts.cancelToken)
    : q.eq("id", opts.appointmentId!);
  const { data: appt } = await q.maybeSingle();

  if (!appt) return { ok: false, reason: "Randevu tapılmadı." };
  if (appt.cancel_used || appt.status === "cancelled")
    return { ok: false, reason: "Bu randevu artıq ləğv edilib." };
  if (["completed", "no_show"].includes(appt.status as string))
    return { ok: false, reason: "Bu randevu ləğv oluna bilməz." };

  await db
    .from("appointments")
    .update({ status: "cancelled", cancel_used: true, notified_cancelled: true })
    .eq("id", appt.id);
  await db.from("availability_slots").update({ status: "open" }).eq("id", appt.slot_id);

  await bump("cancelled");

  const startAt = (appt as unknown as { availability_slots: { start_at: string } })
    .availability_slots.start_at;
  await Promise.all([
    sendCancelled(appt.patient_email, startAt),
    sendDoctorCancelledNotice(startAt, appt.patient_email),
  ]);
  return { ok: true };
}

export interface UsageStats {
  uniquePatients: number;
  returningPatients: number;
  booked: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  thisMonth: { booked: number; completed: number; cancelled: number };
}

/** Aggregate usage for the admin dashboard. Reads counters, never patient data. */
export async function getUsageStats(): Promise<UsageStats> {
  const db = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  const monthKey = monthStart.toISOString().slice(0, 10);

  const [allRows, monthRows, fps, upcoming] = await Promise.all([
    db.from("usage_stats").select("booked, completed, cancelled"),
    db.from("usage_stats").select("booked, completed, cancelled").gte("day", monthKey),
    db.from("patients").select("visit_count"),
    db
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "booked"),
  ]);

  const sum = (rows: { booked: number; completed: number; cancelled: number }[] | null) =>
    (rows ?? []).reduce(
      (a, r) => ({
        booked: a.booked + r.booked,
        completed: a.completed + r.completed,
        cancelled: a.cancelled + r.cancelled,
      }),
      { booked: 0, completed: 0, cancelled: 0 },
    );

  const all = sum(allRows.data);
  const month = sum(monthRows.data);
  const visits = (fps.data ?? []) as { visit_count: number }[];

  return {
    uniquePatients: visits.length,
    returningPatients: visits.filter((v) => v.visit_count > 1).length,
    booked: all.booked,
    completed: all.completed,
    cancelled: all.cancelled,
    upcoming: upcoming.count ?? 0,
    thisMonth: month,
  };
}

export interface PatientRow {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  /** Live (not yet purged) appointments for this patient, newest first. */
  appointments: { id: string; startAt: string; status: string }[];
}

/**
 * Patient directory for the admin panel — who has booked, how often, and when
 * they were last seen, so a returning patient is recognisable.
 *
 * Only appointments still in the table appear under `appointments`: completed
 * ones are purged an hour after the call (§14.3), so `visitCount` is the
 * durable record of how many times someone has been seen.
 */
export async function listPatients(): Promise<PatientRow[]> {
  const db = createAdminClient();

  const [{ data: patients }, { data: appts }] = await Promise.all([
    db
      .from("patients")
      .select("id, email, full_name, phone, first_seen, last_seen, visit_count")
      .order("last_seen", { ascending: false }),
    // start_at lives on the slot, not the appointment — embed it.
    db.from("appointments").select("id, patient_email, status, availability_slots(start_at)"),
  ]);

  const byEmail = new Map<string, { id: string; startAt: string; status: string }[]>();
  for (const a of (appts ?? []) as unknown as {
    id: string;
    patient_email: string;
    status: string;
    availability_slots: { start_at: string } | null;
  }[]) {
    const startAt = a.availability_slots?.start_at;
    if (!startAt) continue;
    const key = a.patient_email.toLowerCase();
    const list = byEmail.get(key) ?? [];
    list.push({ id: a.id, startAt, status: a.status });
    byEmail.set(key, list);
  }
  for (const list of byEmail.values()) {
    list.sort((x, y) => y.startAt.localeCompare(x.startAt)); // newest first
  }

  return ((patients ?? []) as {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    first_seen: string;
    last_seen: string;
    visit_count: number;
  }[]).map((p) => ({
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    firstSeen: p.first_seen,
    lastSeen: p.last_seen,
    visitCount: p.visit_count,
    appointments: byEmail.get(p.email.toLowerCase()) ?? [],
  }));
}

/**
 * Correct a patient's details from the admin panel.
 *
 * `null` clears a field — the doctor may need to remove a wrong number, not
 * only add a missing one. Email is deliberately not editable: it is the key the
 * appointments join on, so changing it here would silently orphan their history.
 */
export async function updatePatient(
  id: string,
  fields: { fullName: string | null; phone: string | null },
): Promise<{ ok: boolean }> {
  const db = createAdminClient();
  const { error } = await db
    .from("patients")
    .update({ full_name: fields.fullName, phone: fields.phone })
    .eq("id", id);
  if (error) {
    console.error("[patients] update failed:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

/** Erase a patient from the directory — needed to honour a deletion request. */
export async function deletePatient(id: string): Promise<{ ok: boolean }> {
  const db = createAdminClient();
  const { error } = await db.from("patients").delete().eq("id", id);
  if (error) {
    console.error("[patients] delete failed:", error.message);
    return { ok: false };
  }
  return { ok: true };
}

/**
 * Doctor books a patient directly (e.g. they phoned in). Skips the email
 * double opt-in entirely — the doctor IS the confirmation — so it lands as
 * `booked` with a room, and both parties get the confirmation mail.
 */
type DoctorPatient = { email: string; fullName?: string; phone?: string };

/**
 * Shared tail for a doctor-created booking: the slot is already reserved
 * (`booked`), so insert the appointment, mint the room, bump stats and notify
 * both parties. `failed` tells the caller to roll the slot back.
 */
async function finalizeDoctorBooking(
  db: ReturnType<typeof createAdminClient>,
  slotId: string,
  startAt: string,
  { email, fullName, phone }: DoctorPatient,
): Promise<
  | { ok: true; appointmentId: string }
  | { ok: false; reason: string; failed: true }
> {
  const { data: appt, error } = await db
    .from("appointments")
    .insert({
      slot_id: slotId,
      patient_email: email,
      full_name: fullName ?? null,
      phone: phone ?? null,
      status: "booked",
      consent_version: CONSENT_VERSION,
      notified_booked: true,
    })
    .select("id, cancel_token")
    .single();
  if (error || !appt) {
    return { ok: false, reason: error?.message ?? "Xəta baş verdi.", failed: true };
  }

  const room = await mintRoom(appt.id as string);
  await db.from("appointments").update({ video_room: room }).eq("id", appt.id);

  await bump("booked", { email, fullName, phone });
  await Promise.all([
    sendBookingConfirmed(email, startAt, consultationUrl(appt.id as string), appt.cancel_token),
    sendDoctorBookingNotice(startAt, email, consultationUrl(appt.id as string)),
  ]);

  return { ok: true, appointmentId: appt.id as string };
}

export async function createAppointmentAsDoctor(
  slotId: string,
  patient: DoctorPatient,
): Promise<{ ok: true; appointmentId: string } | { ok: false; reason: string }> {
  const db = createAdminClient();

  // Flip open → booked only if still open (guards against a race with a patient).
  const { data: slot, error: slotErr } = await db
    .from("availability_slots")
    .update({ status: "booked" })
    .eq("id", slotId)
    .eq("status", "open")
    .select("start_at")
    .maybeSingle();
  if (slotErr) return { ok: false, reason: slotErr.message };
  if (!slot) return { ok: false, reason: "Bu vaxt artıq tutulub." };

  const r = await finalizeDoctorBooking(db, slotId, slot.start_at, patient);
  if (!r.ok) await db.from("availability_slots").update({ status: "open" }).eq("id", slotId);
  return r.ok ? { ok: true, appointmentId: r.appointmentId } : { ok: false, reason: r.reason };
}

/**
 * Doctor starts a consultation right now (walk-in) — no pre-existing slot.
 * Creates a fresh slot at the current time already `booked`, then books it, so
 * the room's join window is open immediately.
 */
export async function createInstantAppointmentAsDoctor(
  patient: DoctorPatient,
): Promise<{ ok: true; appointmentId: string } | { ok: false; reason: string }> {
  const db = createAdminClient();
  const start = new Date();
  const end = new Date(start.getTime() + SLOT_MINUTES * 60_000);

  const { data: slot, error } = await db
    .from("availability_slots")
    .insert({ start_at: start.toISOString(), end_at: end.toISOString(), status: "booked" })
    .select("id, start_at")
    .single();
  if (error || !slot) return { ok: false, reason: error?.message ?? "Slot yaradıla bilmədi." };

  const r = await finalizeDoctorBooking(db, slot.id as string, slot.start_at, patient);
  if (!r.ok) await db.from("availability_slots").delete().eq("id", slot.id);
  return r.ok ? { ok: true, appointmentId: r.appointmentId } : { ok: false, reason: r.reason };
}

/** Appointments list for the doctor's admin panel. */
export async function listAppointments(): Promise<
  (Appointment & { start_at: string })[]
> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("appointments")
    .select("*, availability_slots(start_at)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({
    ...(a as unknown as Appointment),
    start_at: (a as unknown as { availability_slots: { start_at: string } })
      .availability_slots.start_at,
  }));
}

/** Fetch a booked appointment for the consultation room. */
export async function getBookedAppointment(id: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("appointments")
    .select("id, status, video_room, cancel_token, availability_slots(start_at)")
    .eq("id", id)
    .maybeSingle();
  return data;
}
