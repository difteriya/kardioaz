"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsultationRoom } from "./consultation-room";
import {
  joinWindow,
  countdownAz,
  JOIN_EARLY_MINUTES,
  type JoinState,
} from "@/lib/booking/join-window";

const SHELL = "min-h-[calc(100svh-73px)]";

/**
 * Holds the patient (and doctor) outside the room until the consultation is due.
 *
 * The countdown re-evaluates every second and flips to the room on its own, so
 * someone who opens the link early never has to reload to get in. The server
 * enforces the same window when minting the token — this is the friendly face
 * of that rule, not the rule itself.
 */
export function ConsultationGate({
  appointmentId,
  startAtIso,
  startAtLabel,
  cancelToken,
}: {
  appointmentId: string;
  startAtIso: string;
  startAtLabel: string;
  cancelToken?: string;
}) {
  // Rendered on the server first, so start from the same basis and let the
  // first tick correct it — avoids a hydration mismatch on the countdown.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now === null) {
    return (
      <div className={`mx-auto flex ${SHELL} max-w-lg items-center justify-center px-5`}>
        <p className="text-ink-soft">Yüklənir…</p>
      </div>
    );
  }

  const win = joinWindow(startAtIso, now);

  if (win.state === "open") {
    return (
      <ConsultationRoom
        appointmentId={appointmentId}
        startAtLabel={startAtLabel}
        cancelToken={cancelToken}
      />
    );
  }

  return (
    <Waiting
      state={win.state}
      msUntilOpen={win.opensAt - now}
      startAtLabel={startAtLabel}
      cancelToken={cancelToken}
    />
  );
}

function Waiting({
  state,
  msUntilOpen,
  startAtLabel,
  cancelToken,
}: {
  state: Exclude<JoinState, "open">;
  msUntilOpen: number;
  startAtLabel: string;
  cancelToken?: string;
}) {
  const [cancelState, setCancelState] = useState<"idle" | "confirm" | "busy" | "done">(
    "idle",
  );
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  async function cancel() {
    if (!cancelToken) return;
    setCancelState("busy");
    setCancelMsg(null);
    const res = await fetch("/api/appointments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: cancelToken }),
    });
    if (res.ok) {
      setCancelState("done");
    } else {
      const d = await res.json().catch(() => ({}));
      setCancelMsg(d.error ?? "Ləğv alınmadı.");
      setCancelState("idle");
    }
  }

  if (cancelState === "done") {
    return (
      <Shell>
        <h1 className="font-display text-2xl font-semibold text-ink">Randevu ləğv edildi</h1>
        <p className="mt-3 text-ink-soft">
          Randevunuz ləğv olundu və vaxt yenidən açıldı. Təsdiq e-poçtu göndərildi.
        </p>
        <Link
          href="/randevu"
          className="mt-8 inline-block rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-porcelain transition-colors hover:bg-teal-deep"
        >
          Yeni randevu al
        </Link>
      </Shell>
    );
  }

  if (state === "expired") {
    return (
      <Shell>
        <span className="eyebrow text-ink-soft">Konsultasiya</span>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
          Bu konsultasiyanın vaxtı bitib
        </h1>
        <p className="mt-3 text-ink-soft">
          <strong className="text-ink">{startAtLabel}</strong> təyin olunmuş randevunun vaxtı
          keçib, otaq bağlanıb.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Görüş baş tutmayıbsa, yeni randevu götürə və ya bizimlə əlaqə saxlaya bilərsiniz.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/randevu"
            className="rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-porcelain transition-colors hover:bg-teal-deep"
          >
            Yeni randevu al
          </Link>
          <Link
            href="/elaqe"
            className="rounded-xl border border-mist px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-porcelain-2"
          >
            Əlaqə
          </Link>
        </div>
      </Shell>
    );
  }

  // state === "early"
  const opensSoon = msUntilOpen <= 60 * 60_000; // within the hour

  return (
    <Shell>
      <span className="eyebrow text-ink-soft">Konsultasiya</span>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
        Randevunuz təsdiqlənib
      </h1>
      <p className="mt-3 text-ink-soft">
        Görüş vaxtı: <strong className="text-ink">{startAtLabel}</strong>
      </p>

      <div className="mt-8 rounded-2xl border border-teal/30 bg-teal/[0.06] px-6 py-5">
        <p className="text-sm text-ink-soft">Otağın açılmasına qalıb</p>
        <p
          className="mt-1 font-display text-3xl font-semibold text-teal"
          aria-live={opensSoon ? "polite" : "off"}
        >
          {countdownAz(msUntilOpen)}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Otaq randevudan <strong className="text-ink">{JOIN_EARLY_MINUTES} dəqiqə</strong>{" "}
          əvvəl açılır. Bu səhifə açıq qalsa, otaq avtomatik aktivləşəcək — yeniləməyə ehtiyac
          yoxdur.
        </p>
      </div>

      <div className="mt-8 text-left">
        <p className="eyebrow text-ink-soft">Hazırlıq</p>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          <li>• Sakit və işıqlı bir yerdə olun.</li>
          <li>• Kamera və mikrofona icazə verin — brauzer soruşacaq.</li>
          <li>• Sabit internet bağlantısı (mümkünsə Wi-Fi) istifadə edin.</li>
          <li>• Dərmanlarınızın siyahısı və əvvəlki analizləriniz əlinizin altında olsun.</li>
        </ul>
      </div>

      {cancelToken && (
        <div className="mt-8 border-t border-mist pt-6">
          {cancelState === "confirm" ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-ink-soft">Randevu ləğv edilsin?</span>
              <button
                type="button"
                onClick={cancel}
                className="rounded-lg bg-pulse px-4 py-2 text-sm font-medium text-porcelain transition-colors hover:opacity-90"
              >
                Bəli, ləğv et
              </button>
              <button
                type="button"
                onClick={() => setCancelState("idle")}
                className="rounded-lg border border-mist px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-porcelain-2"
              >
                Xeyr
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCancelState("confirm")}
              disabled={cancelState === "busy"}
              className="text-sm font-medium text-pulse transition-colors hover:underline disabled:opacity-50"
            >
              {cancelState === "busy" ? "Ləğv olunur…" : "Randevunu ləğv et"}
            </button>
          )}
          {cancelMsg && <p className="mt-3 text-sm text-pulse">{cancelMsg}</p>}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mx-auto flex ${SHELL} max-w-lg flex-col justify-center px-5 py-14 text-center`}>
      {children}
    </div>
  );
}
