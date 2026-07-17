"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PulseMark } from "./pulse-mark";

type Mode = "confirm" | "cancel";

const COPY: Record<Mode, { endpoint: string; loading: string; okTitle: string; okBody: string }> = {
  confirm: {
    endpoint: "/api/appointments/confirm",
    loading: "Randevu təsdiqlənir…",
    okTitle: "Randevu təsdiqləndi",
    okBody: "Konsultasiya otağının keçidi e-poçtunuza göndərildi.",
  },
  cancel: {
    endpoint: "/api/appointments/cancel",
    loading: "Randevu ləğv edilir…",
    okTitle: "Randevu ləğv edildi",
    okBody: "Randevunuz ləğv edildi. Yeni vaxt üçün yenidən müraciət edə bilərsiniz.",
  },
};

export function TokenAction({ mode, token }: { mode: Mode; token: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18/19 double-invoke
    ran.current = true;
    if (!token) {
      setState("error");
      setMessage("Keçid etibarsızdır.");
      return;
    }
    fetch(COPY[mode].endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (r.ok) {
          setState("ok");
          setAppointmentId(d.appointmentId ?? null);
        } else {
          setState("error");
          setMessage(d.error ?? "Xəta baş verdi.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Şəbəkə xətası.");
      });
  }, [mode, token]);

  const c = COPY[mode];

  return (
    <div className="mx-auto max-w-lg px-5 pt-20 text-center">
      <PulseMark className="mx-auto h-5 w-40 text-pulse" />
      {state === "loading" && <p className="mt-8 text-ink-soft">{c.loading}</p>}

      {state === "ok" && (
        <div className="mt-8">
          <h1 className="font-display text-3xl font-semibold text-ink">{c.okTitle}</h1>
          <p className="mt-3 text-ink-soft">{c.okBody}</p>
          {mode === "confirm" && appointmentId && (
            <Link
              href={`/konsultasiya/${appointmentId}`}
              className="mt-6 inline-block rounded-xl bg-teal px-6 py-3 font-medium text-porcelain hover:bg-teal-deep"
            >
              Konsultasiya otağına keç
            </Link>
          )}
          <div className="mt-4">
            <Link href="/" className="text-sm text-teal hover:underline">
              Ana səhifəyə qayıt
            </Link>
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="mt-8">
          <h1 className="font-display text-3xl font-semibold text-ink">Alınmadı</h1>
          <p className="mt-3 text-ink-soft">{message}</p>
          <Link
            href="/randevu"
            className="mt-6 inline-block rounded-xl border border-mist px-6 py-3 font-medium text-ink hover:border-teal hover:text-teal"
          >
            Yenidən randevu al
          </Link>
        </div>
      )}
    </div>
  );
}
