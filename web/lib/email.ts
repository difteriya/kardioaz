import "server-only";
import nodemailer from "nodemailer";
import { SITE, CONTACT } from "@/lib/site";
import { formatSlotAz } from "@/lib/booking/config";

/** Where the doctor's copies go. Override with DOCTOR_EMAIL in .env.local. */
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL ?? CONTACT.email;

/**
 * Email sender. In local dev this targets Supabase's bundled Inbucket SMTP
 * (127.0.0.1:54325) so confirm/cancel mails land in the Inbucket inbox
 * (http://127.0.0.1:54324) — no real provider needed for the demo. In prod,
 * point SMTP_* at a transactional provider. (PROJECT-PLAN.md §14.8)
 */
function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "127.0.0.1",
    port: Number(process.env.SMTP_PORT ?? 54325),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
      : undefined,
  });
}

const FROM = process.env.SMTP_FROM ?? "kardio.az <randevu@kardio.az>";

function baseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function send(to: string, subject: string, html: string) {
  try {
    await transport().sendMail({ from: FROM, to, subject, html });
  } catch (err) {
    // Never let a mail failure break the booking flow; log for the dev.
    console.error("[email] send failed:", (err as Error).message);
  }
}

export async function sendBookingConfirmationRequest(
  to: string,
  slotStartIso: string,
  confirmToken: string,
) {
  const link = `${baseUrl()}/randevu/tesdiq?token=${confirmToken}`;
  await send(
    to,
    "Randevunuzu təsdiqləyin — kardio.az",
    `<p>Salam,</p>
     <p><strong>${formatSlotAz(slotStartIso)}</strong> (Azərbaycan vaxtı) üçün randevu tutdunuz.</p>
     <p>Randevunu təsdiqləmək üçün 15 dəqiqə ərzində keçidə klikləyin:</p>
     <p><a href="${link}">Randevunu təsdiqlə</a></p>
     <p>Bu siz deyilsinizsə, məktubu nəzərə almayın.</p>
     <p>— ${SITE.name}</p>`,
  );
}

export async function sendBookingConfirmed(
  to: string,
  slotStartIso: string,
  roomUrl: string,
  cancelToken: string,
) {
  const cancel = `${baseUrl()}/randevu/legv?token=${cancelToken}`;
  await send(
    to,
    "Randevu təsdiqləndi — kardio.az",
    `<p>Randevunuz təsdiqləndi.</p>
     <p><strong>Vaxt:</strong> ${formatSlotAz(slotStartIso)} (Azərbaycan vaxtı)</p>
     <p><strong>Konsultasiya otağı:</strong> <a href="${roomUrl}">${roomUrl}</a></p>
     <p>Randevunu ləğv etmək üçün: <a href="${cancel}">ləğv et</a></p>
     <p>— ${SITE.name}</p>`,
  );
}

/* ---------------------------------------------------------------- */
/* Doctor copies — the doctor is notified of every booking/cancel so */
/* he doesn't have to watch the admin panel (PROJECT-PLAN §14.8).    */
/* ---------------------------------------------------------------- */

export async function sendDoctorBookingNotice(
  slotStartIso: string,
  patientEmail: string,
  roomUrl: string,
) {
  await send(
    DOCTOR_EMAIL,
    `Yeni randevu: ${formatSlotAz(slotStartIso)} — kardio.az`,
    `<p>Yeni onlayn konsultasiya təsdiqləndi.</p>
     <p><strong>Vaxt:</strong> ${formatSlotAz(slotStartIso)} (Azərbaycan vaxtı)</p>
     <p><strong>Pasiyent:</strong> ${patientEmail}</p>
     <p><strong>Konsultasiya otağı:</strong> <a href="${roomUrl}">${roomUrl}</a></p>
     <p>Otağa vaxtında qoşulun — ilk qoşulan moderator olur.</p>
     <p>— ${SITE.name}</p>`,
  );
}

export async function sendDoctorCancelledNotice(
  slotStartIso: string,
  patientEmail: string,
) {
  await send(
    DOCTOR_EMAIL,
    `Randevu ləğv edildi: ${formatSlotAz(slotStartIso)} — kardio.az`,
    `<p>Randevu ləğv edildi və vaxt yenidən açıldı.</p>
     <p><strong>Vaxt:</strong> ${formatSlotAz(slotStartIso)} (Azərbaycan vaxtı)</p>
     <p><strong>Pasiyent:</strong> ${patientEmail}</p>
     <p>— ${SITE.name}</p>`,
  );
}

export async function sendCancelled(to: string, slotStartIso: string) {
  await send(
    to,
    "Randevu ləğv edildi — kardio.az",
    `<p><strong>${formatSlotAz(slotStartIso)}</strong> (Azərbaycan vaxtı) üçün randevunuz ləğv edildi.</p>
     <p>Yeni randevu üçün saytımıza daxil olun.</p>
     <p>— ${SITE.name}</p>`,
  );
}
