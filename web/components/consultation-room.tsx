"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { PulseMark } from "./pulse-mark";
import { FileShare } from "./file-share";

/**
 * Consultation room — LiveKit embedded inside our own page, filling the viewport
 * like a real call app (video + chat + screen share + file sharing).
 *
 * No recording (PROJECT-PLAN.md §14.2): we never call the egress API and the UI
 * exposes no record button. The patient never leaves kardio.az and never sees a
 * provider URL — joining requires a token minted by our own API.
 */

/** Site header height — the call fills whatever is left of the viewport. */
const SHELL = "h-[calc(100svh-73px)]";

export function ConsultationRoom({
  appointmentId,
  startAtLabel,
  cancelToken,
}: {
  appointmentId: string;
  startAtLabel: string;
  cancelToken?: string;
}) {
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [left, setLeft] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showFiles, setShowFiles] = useState(false);
  const [unseenFile, setUnseenFile] = useState(false);

  const [confirming, setConfirming] = useState(false);
  const [cancelState, setCancelState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [cancelMsg, setCancelMsg] = useState<string | null>(null);

  const [endState, setEndState] = useState<"idle" | "busy" | "done">("idle");
  const [endMsg, setEndMsg] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setJoinError(null);
    try {
      const res = await fetch(`/api/consultation/${appointmentId}/token`, { method: "POST" });
      const d = (await res.json().catch(() => ({}))) as {
        token?: string;
        url?: string;
        error?: string;
      };
      if (!res.ok || !d.token || !d.url) {
        setJoinError(d.error ?? "Otağa qoşulmaq alınmadı.");
        return;
      }
      setConn({ token: d.token, url: d.url });
    } catch {
      setJoinError("Şəbəkə xətası.");
    }
  }, [appointmentId]);

  useEffect(() => {
    if (!left && endState !== "done") connect();
  }, [connect, left, endState]);

  const flagIncoming = useCallback(() => setUnseenFile(true), []);

  /* ---------------- true browser fullscreen ----------------
   * LiveKit's tile button is a *focus* toggle, not fullscreen. This puts the
   * whole call shell into real fullscreen via the Fullscreen API (needs a user
   * gesture, hence the click handler). Safari/iOS use webkit-prefixed calls.
   */
  useEffect(() => {
    const sync = () => {
      const el =
        document.fullscreenElement ??
        (document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement ??
        null;
      setIsFullscreen(Boolean(el));
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  async function toggleFullscreen() {
    const el = shellRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    const active =
      document.fullscreenElement ??
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement;

    try {
      if (active) {
        await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      } else if (el) {
        await (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.());
      }
    } catch (e) {
      console.error("[fullscreen] failed:", e);
    }
  }

  async function cancelConsultation() {
    if (!cancelToken) return;
    setCancelState("busy");
    setCancelMsg(null);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cancelToken }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setCancelState("done");
      else {
        setCancelState("error");
        setCancelMsg(d.error ?? "Ləğv alınmadı.");
      }
    } catch {
      setCancelState("error");
      setCancelMsg("Şəbəkə xətası.");
    }
  }

  /** End the consultation for good — marks it completed and schedules the purge. */
  async function endConsultation() {
    setEndState("busy");
    setEndMsg(null);
    try {
      const res = await fetch("/api/appointments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelToken ? { token: cancelToken } : { appointmentId }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) setEndState("done");
      else {
        setEndState("idle");
        setEndMsg(d.error ?? "Tamamlanmadı.");
      }
    } catch {
      setEndState("idle");
      setEndMsg("Şəbəkə xətası.");
    }
  }

  /* ---------------- terminal states ---------------- */

  if (endState === "done") {
    return (
      <div className={`mx-auto flex ${SHELL} max-w-lg flex-col items-center justify-center px-5 text-center`}>
        <PulseMark className="h-5 w-40 text-pulse" />
        <h1 className="mt-8 font-display text-3xl font-semibold text-ink">
          Konsultasiya tamamlandı
        </h1>
        <p className="mt-3 text-ink-soft">
          Sağlamlığınıza diqqət etdiyiniz üçün təşəkkür edirik. Məlumatlarınız qısa müddət
          sonra avtomatik silinir.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/" className="rounded-xl bg-teal px-6 py-3 font-medium text-porcelain hover:bg-teal-deep">
            Ana səhifə
          </Link>
          <Link href="/randevu" className="rounded-xl border border-mist px-6 py-3 font-medium text-ink hover:border-teal hover:text-teal">
            Yeni randevu
          </Link>
        </div>
      </div>
    );
  }

  if (cancelState === "done") {
    return (
      <div className={`mx-auto flex ${SHELL} max-w-lg flex-col items-center justify-center px-5 text-center`}>
        <PulseMark className="h-5 w-40 text-pulse" />
        <h1 className="mt-8 font-display text-3xl font-semibold text-ink">
          Konsultasiya ləğv edildi
        </h1>
        <p className="mt-3 text-ink-soft">
          Randevunuz ləğv edildi və vaxt yenidən açıldı. Təsdiq e-poçtu göndərildi.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/randevu" className="rounded-xl bg-teal px-6 py-3 font-medium text-porcelain hover:bg-teal-deep">
            Yeni randevu al
          </Link>
          <Link href="/" className="rounded-xl border border-mist px-6 py-3 font-medium text-ink hover:border-teal hover:text-teal">
            Ana səhifə
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- full-screen call ---------------- */

  return (
    // In fullscreen the header is gone, so the shell takes the whole screen.
    <div
      ref={shellRef}
      className={`flex flex-col bg-porcelain ${isFullscreen ? "h-screen" : SHELL}`}
    >
      {/* slim control bar — dark, so it reads as call chrome rather than page UI */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-porcelain/10 bg-ink px-5 py-2.5">
        <div className="flex items-center gap-3">
          <PulseMark className="h-3 w-10 text-pulse" />
          <span className="font-display text-base font-semibold text-porcelain">
            Konsultasiya otağı
          </span>
          <span className="rounded-full border border-porcelain/20 px-2.5 py-0.5 text-xs text-porcelain/70">
            {startAtLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cancelMsg && <span className="text-sm text-pulse">{cancelMsg}</span>}
          {endMsg && <span className="text-sm text-pulse">{endMsg}</span>}

          {conn && !left && !joinError && (
            <button
              type="button"
              onClick={() => {
                setShowFiles((v) => !v);
                setUnseenFile(false);
              }}
              className="relative rounded-xl border border-porcelain/25 px-4 py-1.5 text-sm font-medium text-porcelain transition-colors hover:bg-porcelain/10"
            >
              Fayllar
              {unseenFile && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-pulse" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam ekrandan çıx (Esc)" : "Tam ekran"}
            className="inline-flex items-center gap-2 rounded-xl border border-porcelain/25 px-4 py-1.5 text-sm font-medium text-porcelain transition-colors hover:bg-porcelain/10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              {isFullscreen ? (
                <path
                  d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
            {isFullscreen ? "Çıx" : "Tam ekran"}
          </button>

          {cancelToken && !left && (
            confirming ? (
              <>
                <span className="text-sm text-porcelain">Ləğv edilsin?</span>
                <button
                  type="button"
                  onClick={cancelConsultation}
                  disabled={cancelState === "busy"}
                  className="rounded-xl bg-pulse px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {cancelState === "busy" ? "Ləğv olunur…" : "Bəli"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-xl border border-porcelain/25 px-4 py-1.5 text-sm text-porcelain transition-colors hover:bg-porcelain/10"
                >
                  Xeyr
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="rounded-xl border border-pulse/50 px-4 py-1.5 text-sm font-medium text-pulse transition-colors hover:bg-pulse/10"
              >
                Ləğv et
              </button>
            )
          )}

          <button
            type="button"
            onClick={endConsultation}
            disabled={endState === "busy"}
            className="rounded-xl bg-porcelain px-4 py-1.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {endState === "busy" ? "Tamamlanır…" : "Konsultasiyanı bitir"}
          </button>
        </div>
      </div>

      {/* video fills everything left */}
      <div className="relative min-h-0 flex-1 bg-ink" data-lk-theme="default">
        {left ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <PulseMark className="h-6 w-56 text-pulse/60" />
            <p className="text-porcelain/80">Konsultasiyadan çıxdınız.</p>
            <div className="mt-1 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConn(null);
                  setLeft(false);
                }}
                className="rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-porcelain hover:bg-teal-deep"
              >
                Yenidən qoşul
              </button>
              <button
                type="button"
                onClick={endConsultation}
                disabled={endState === "busy"}
                className="rounded-xl border border-porcelain/30 px-5 py-2.5 text-sm font-medium text-porcelain transition-colors hover:bg-porcelain/10 disabled:opacity-50"
              >
                {endState === "busy" ? "Tamamlanır…" : "Konsultasiyanı bitir"}
              </button>
            </div>
          </div>
        ) : joinError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <PulseMark className="h-5 w-40 text-pulse/60" />
            <p className="max-w-md text-porcelain/80">{joinError}</p>
            <button
              type="button"
              onClick={connect}
              className="mt-2 rounded-xl border border-porcelain/25 px-4 py-2 text-sm text-porcelain hover:bg-porcelain/10"
            >
              Yenidən cəhd et
            </button>
          </div>
        ) : conn ? (
          <LiveKitRoom
            token={conn.token}
            serverUrl={conn.url}
            connect
            video
            audio
            style={{ height: "100%" }}
            onDisconnected={() => setLeft(true)}
            onError={(e) => {
              const msg = e.message || "";
              // A cancelled connection attempt is not a failure: React StrictMode
              // remounts effects in dev, and leaving the call aborts in-flight
              // connects the same way. Only surface real errors.
              if (/client initiated disconnect|cancelled/i.test(msg)) {
                console.warn("[livekit] ignored benign abort:", msg);
                return;
              }
              // The common real-world case: the patient blocked the camera/mic.
              if (/permission denied|notallowed/i.test(msg)) {
                setJoinError(
                  "Kamera və mikrofona icazə verilmədi. Brauzerin ünvan sətrindəki kamera işarəsinə klikləyib icazə verin, sonra yenidən cəhd edin.",
                );
                return;
              }
              if (/notfound|device not found/i.test(msg)) {
                setJoinError(
                  "Kamera və ya mikrofon tapılmadı. Cihazın qoşulduğunu yoxlayıb yenidən cəhd edin.",
                );
                return;
              }
              setJoinError(`Otağa qoşulmaq alınmadı: ${msg}`);
            }}
          >
            <VideoConference />
            <FileShare
              open={showFiles}
              onClose={() => setShowFiles(false)}
              onIncoming={flagIncoming}
            />
          </LiveKitRoom>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-porcelain/70">Otağa qoşulur…</p>
          </div>
        )}
      </div>
    </div>
  );
}
