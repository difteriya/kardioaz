import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookedAppointment } from "@/lib/booking/service";
import { ConsultationGate } from "@/components/consultation-gate";
import { formatSlotAz } from "@/lib/booking/config";

export const metadata: Metadata = {
  title: "Konsultasiya",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appt = await getBookedAppointment(id);

  // The gate: only a real, still-booked appointment renders a room. Whether the
  // room is *open yet* is decided by ConsultationGate, and enforced for real when
  // the join token is minted — see /api/consultation/[id]/token.
  if (!appt || appt.status !== "booked") notFound();

  const startAt =
    (appt as unknown as { availability_slots: { start_at: string } }).availability_slots
      .start_at;
  const cancelToken = (appt as { cancel_token: string }).cancel_token;

  return (
    <ConsultationGate
      appointmentId={id}
      startAtIso={startAt}
      startAtLabel={formatSlotAz(startAt)}
      cancelToken={cancelToken}
    />
  );
}
