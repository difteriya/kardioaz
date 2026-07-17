"use client";

import { useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/components-react";

/**
 * In-call file sharing over the LiveKit data channel, rendered as a drawer over
 * the video.
 *
 * Files travel peer-to-peer through the SFU — they are never uploaded to us or
 * stored anywhere. When the tab closes the blobs are gone. This is what keeps
 * file sharing compliant with the session-only rule (PROJECT-PLAN.md §14.3).
 */
const TOPIC = "kardio-files";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface Shared {
  name: string;
  url: string;
  size: number;
  mine: boolean;
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileShare({
  open,
  onClose,
  onIncoming,
}: {
  open: boolean;
  onClose: () => void;
  onIncoming?: () => void;
}) {
  const room = useRoomContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<Shared[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!room) return;

    const handler = async (
      reader: { info: { name?: string; mimeType?: string }; readAll: () => Promise<Uint8Array[]> },
      participant: { identity: string },
    ) => {
      try {
        const chunks = await reader.readAll();
        const blob = new Blob(chunks as BlobPart[], {
          type: reader.info?.mimeType || "application/octet-stream",
        });
        setFiles((f) => [
          ...f,
          {
            name: reader.info?.name || "fayl",
            url: URL.createObjectURL(blob),
            size: blob.size,
            mine: false,
          },
        ]);
        onIncoming?.();
      } catch (e) {
        console.error("[files] receive failed:", e);
        setErr("Fayl alınmadı.");
      }
      void participant;
    };

    // StrictMode remounts this effect; clear any previous handler first.
    try {
      room.unregisterByteStreamHandler(TOPIC);
    } catch {
      /* none registered */
    }
    try {
      room.registerByteStreamHandler(TOPIC, handler as never);
    } catch (e) {
      console.error("[files] register failed:", e);
    }

    return () => {
      try {
        room.unregisterByteStreamHandler(TOPIC);
      } catch {
        /* already gone */
      }
    };
  }, [room, onIncoming]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !room) return;
    setErr(null);

    if (file.size > MAX_BYTES) {
      setErr(`Fayl çox böyükdür (maks. ${prettySize(MAX_BYTES)}).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      await room.localParticipant.sendFile(file, { topic: TOPIC });
      setFiles((f) => [
        ...f,
        { name: file.name, url: URL.createObjectURL(file), size: file.size, mine: true },
      ]);
    } catch (e) {
      console.error("[files] send failed:", e);
      setErr("Fayl göndərilmədi. Yenidən cəhd edin.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (!open) return null;

  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex w-full max-w-sm flex-col border-l border-mist bg-porcelain shadow-soft-lg">
      <div className="flex items-center justify-between border-b border-mist px-5 py-4">
        <div>
          <p className="eyebrow eyebrow-tick">Fayl paylaşımı</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Bağla"
          className="rounded-lg border border-mist px-2.5 py-1 text-ink transition-colors hover:border-teal hover:text-teal"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="text-sm leading-relaxed text-ink-soft">
          Analiz və şəkilləri göndərin — fayllar yalnız bu görüşdə ötürülür, heç yerdə
          saxlanmır.
        </p>

        <label
          className={`mt-4 block cursor-pointer rounded-xl px-5 py-2.5 text-center text-sm font-medium transition-colors ${
            busy
              ? "cursor-not-allowed bg-mist text-ink-soft"
              : "bg-teal text-porcelain hover:bg-teal-deep"
          }`}
        >
          {busy ? "Göndərilir…" : "Fayl seç"}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            disabled={busy}
            onChange={onPick}
            accept="image/*,application/pdf,.doc,.docx,.txt"
          />
        </label>

        {err && <p className="mt-3 text-sm text-pulse">{err}</p>}

        {files.length === 0 ? (
          <p className="mt-6 text-center text-sm text-ink-soft/70">Hələ fayl yoxdur.</p>
        ) : (
          <ul className="mt-5 space-y-2 border-t border-mist pt-4">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-mist px-4 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{f.name}</span>
                  <span className="text-xs text-ink-soft">
                    {f.mine ? "siz göndərdiniz" : "sizə göndərildi"} · {prettySize(f.size)}
                  </span>
                </span>
                <a
                  href={f.url}
                  download={f.name}
                  className="shrink-0 text-sm font-medium text-teal hover:underline"
                >
                  Yüklə
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
