"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatSlotAz } from "@/lib/booking/config";
import { EMAIL_RE, normalizeName, normalizePhoneAz } from "@/lib/booking/validate";
import { BookingCalendar, type Slot } from "./booking-calendar";

/** Input styling; turns red once the field has content but is still invalid. */
const FIELD = (invalid: boolean) =>
  `mt-1 w-full rounded-xl border bg-porcelain px-4 py-2.5 text-ink outline-none ${
    invalid ? "border-pulse/60 focus:border-pulse" : "border-mist focus:border-teal"
  }`;

const CONSENTS = [
  {
    key: "c1",
    node: (
      <>
        Onlayn konsultasiyanın üzbəüz müayinəni əvəz etmədiyini başa düşürəm.{" "}
        <Link href="/teletibb-razaliq" target="_blank" className="text-teal underline">
          Teletibb razılığı
        </Link>{" "}
        və{" "}
        <Link href="/tibbi-bildiris" target="_blank" className="text-teal underline">
          tibbi bildiriş
        </Link>{" "}
        ilə tanış oldum.
      </>
    ),
  },
  {
    key: "c2",
    node: (
      <>
        Fərdi məlumatlarımın konsultasiya məqsədilə emalına açıq razılıq verirəm.{" "}
        <Link href="/mexfilik-siyaseti" target="_blank" className="text-teal underline">
          Məxfilik siyasəti
        </Link>
        .
      </>
    ),
  },
  {
    key: "c3",
    node: (
      <>
        <Link href="/istifade-sertleri" target="_blank" className="text-teal underline">
          İstifadə şərtləri
        </Link>{" "}
        və{" "}
        <Link href="/randevu-siyaseti" target="_blank" className="text-teal underline">
          randevu siyasəti
        </Link>{" "}
        ilə razıyam.
      </>
    ),
  },
] as const;

export function BookingForm() {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]));
  }, []);

  const selectedSlot = slots?.find((s) => s.id === selected) ?? null;
  const allConsented = CONSENTS.every((c) => consent[c.key]);

  // Validated with the same helpers the API uses, so the button never promises
  // something the server will reject.
  const nameOk = !!normalizeName(fullName);
  const phoneOk = !!normalizePhoneAz(phone);
  const emailOk = EMAIL_RE.test(email);
  const canSubmit = selected && emailOk && nameOk && phoneOk && allConsented;

  async function submit() {
    if (!canSubmit) return;
    setStatus("submitting");
    setError(null);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: selected, email, fullName, phone, consent: true }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Xəta baş verdi. Yenidən cəhd edin.");
      setStatus("error");
      // slot may be gone — refresh list
      fetch("/api/availability").then((r) => r.json()).then((d) => setSlots(d.slots ?? []));
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-teal/30 bg-teal/5 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">E-poçtunuzu yoxlayın</h2>
        <p className="mt-3 text-ink-soft">
          <strong>{email}</strong> ünvanına təsdiq keçidi göndərdik. Randevunu tamamlamaq üçün
          15 dəqiqə ərzində keçidə klikləyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Slots — calendar: pick a day, then a time */}
      <section>
        <h2 className="eyebrow mb-4">1 — Vaxt seçin</h2>
        {slots === null ? (
          <p className="text-ink-soft">Yüklənir…</p>
        ) : (
          <BookingCalendar slots={slots} selected={selected} onSelect={setSelected} />
        )}
        {selectedSlot && (
          <p className="mt-5 rounded-xl border border-teal/30 bg-teal/[0.06] px-4 py-3 text-sm text-ink">
            Seçilmiş vaxt: <strong>{formatSlotAz(selectedSlot.start_at)}</strong>
          </p>
        )}
      </section>

      {/* Contact details */}
      <section>
        <h2 className="eyebrow mb-4">2 — Əlaqə məlumatları</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="block text-ink-soft">Ad və soyad</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              placeholder="Aysel Məmmədova"
              className={FIELD(fullName.length > 0 && !nameOk)}
            />
            {fullName.length > 0 && !nameOk && (
              <span className="mt-1 block text-xs text-pulse">Ad və soyadınızı tam yazın.</span>
            )}
          </label>

          <label className="text-sm">
            <span className="block text-ink-soft">Mobil nömrə</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              placeholder="+994 50 123 45 67"
              className={FIELD(phone.length > 0 && !phoneOk)}
            />
            {phone.length > 0 && !phoneOk && (
              <span className="mt-1 block text-xs text-pulse">
                Nömrə düzgün deyil. Məsələn: +994 50 123 45 67
              </span>
            )}
          </label>

          <label className="text-sm sm:col-span-2">
            <span className="block text-ink-soft">E-poçt</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="ornek@email.com"
              className={FIELD(email.length > 0 && !emailOk)}
            />
            <span className="mt-1 block text-xs text-ink-soft/70">
              Təsdiq keçidi bu ünvana göndəriləcək.
            </span>
          </label>
        </div>
      </section>

      {/* Consent */}
      <section>
        <h2 className="eyebrow mb-4">3 — Razılıq</h2>
        <div className="space-y-3">
          {CONSENTS.map((c) => (
            <label key={c.key} className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={!!consent[c.key]}
                onChange={(e) => setConsent((v) => ({ ...v, [c.key]: e.target.checked }))}
                className="mt-1 h-4 w-4 shrink-0 accent-teal"
              />
              <span>{c.node}</span>
            </label>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-pulse">{error}</p>}

      <button
        type="button"
        disabled={!canSubmit || status === "submitting"}
        onClick={submit}
        className="w-full rounded-xl bg-teal px-6 py-3 font-medium text-porcelain transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "submitting" ? "Göndərilir…" : "Randevunu təsdiqlə"}
      </button>
    </div>
  );
}
