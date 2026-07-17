"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AZ_MONTHS, AZ_WEEKDAYS, azDateKey, dateKey, SLOT_MINUTES } from "@/lib/booking/config";

const cap = (s: string) => s.charAt(0).toLocaleUpperCase("az") + s.slice(1);

/** Weekday index (Mon=0) for a "YYYY-MM-DD" key. */
function weekdayOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

type RepeatMode = "none" | "weekly" | "monthly" | "yearly";

const REPEAT_LABEL: Record<RepeatMode, string> = {
  none: "Təkrarlanmasın",
  weekly: "Hər həftə",
  monthly: "Hər ay",
  yearly: "Hər il",
};

/** Max repeats offered per mode. */
const REPEAT_MAX: Record<RepeatMode, number> = { none: 1, weekly: 52, monthly: 12, yearly: 5 };

/** Shift a "YYYY-MM-DD" key by `i` repeats of the given mode. */
function shiftByRepeat(key: string, mode: RepeatMode, i: number): string {
  const [y, m, d] = key.split("-").map(Number);
  let dt: Date;
  if (mode === "weekly") dt = new Date(y, m - 1, d + i * 7);
  else if (mode === "monthly") dt = new Date(y, m - 1 + i, d);
  else if (mode === "yearly") dt = new Date(y + i, m - 1, d);
  else return key;
  return dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

/** 30-min time steps from start to end, e.g. 09:00→12:00 = 6 slots. */
function timesBetween(start: string, end: string): string[] {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  const out: string[] = [];
  for (let t = s; t + SLOT_MINUTES <= e; t += SLOT_MINUTES) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return out;
}

export function AdminSlotCalendar({ onCreated }: { onCreated?: () => void }) {
  const todayKey = useMemo(() => azDateKey(new Date().toISOString()), []);
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayKey.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [repeatCount, setRepeatCount] = useState(4);
  const [existing, setExisting] = useState<Map<string, number>>(new Map());
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadExisting = useCallback(async () => {
    try {
      const r = await fetch("/api/availability");
      const d = await r.json();
      const m = new Map<string, number>();
      for (const s of d.slots ?? []) {
        const k = azDateKey(s.start_at);
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      setExisting(m);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const cells = useMemo(() => {
    const firstWeekday = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7;
    const dayCount = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= dayCount; d++) out.push(dateKey(cursor.y, cursor.m, d));
    return out;
  }, [cursor]);

  const monthDays = useMemo(() => cells.filter(Boolean) as string[], [cells]);
  const times = useMemo(() => timesBetween(startTime, endTime), [startTime, endTime]);
  const repeats = repeatMode === "none" ? 1 : Math.max(1, Math.min(repeatCount, REPEAT_MAX[repeatMode]));
  const total = selectedDays.size * times.length * repeats;

  const canGoPrev = useMemo(() => {
    const [ty, tm] = todayKey.split("-").map(Number);
    return cursor.y > ty || (cursor.y === ty && cursor.m > tm - 1);
  }, [cursor, todayKey]);

  function shiftMonth(delta: number) {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  }

  function toggleDay(k: string) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  /** Repeatable: toggle every occurrence of this weekday in the shown month. */
  function toggleWeekday(widx: number) {
    const keys = monthDays.filter((k) => weekdayOf(k) === widx && k >= todayKey);
    if (keys.length === 0) return;
    const allOn = keys.every((k) => selectedDays.has(k));
    setSelectedDays((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (allOn) next.delete(k);
        else next.add(k);
      }
      return next;
    });
  }

  async function submit() {
    if (total === 0) return;
    setBusy(true);
    setMsg(null);
    // Expand each chosen day across the repeat series, then each time step.
    const set = new Set<string>();
    for (const day of [...selectedDays].sort()) {
      for (let i = 0; i < repeats; i++) {
        const d = shiftByRepeat(day, repeatMode, i);
        for (const t of times) {
          // Azerbaijan time (UTC+4) → UTC ISO
          set.add(new Date(`${d}T${t}:00+04:00`).toISOString());
        }
      }
    }
    const starts = [...set].sort();
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starts }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        const skipped = starts.length - (d.created ?? 0);
        setMsg(
          `${d.created} slot əlavə edildi.` +
            (skipped > 0 ? ` ${skipped} slot artıq mövcud idi və ötürüldü.` : ""),
        );
        setSelectedDays(new Set());
        await loadExisting();
        onCreated?.();
      } else {
        setMsg(d.error ?? "Xəta baş verdi.");
      }
    } catch {
      setMsg("Şəbəkə xətası.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      {/* ---- Calendar ---- */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            disabled={!canGoPrev}
            aria-label="Əvvəlki ay"
            className="rounded-lg border border-mist px-2.5 py-1 text-ink transition-colors hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-30"
          >
            ←
          </button>
          <span className="font-display text-lg font-semibold text-ink">
            {cap(AZ_MONTHS[cursor.m])} {cursor.y}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Növbəti ay"
            className="rounded-lg border border-mist px-2.5 py-1 text-ink transition-colors hover:border-teal hover:text-teal"
          >
            →
          </button>
        </div>

        {/* Weekday headers double as "repeat this weekday all month" */}
        <div className="mt-5 grid grid-cols-7 gap-1">
          {AZ_WEEKDAYS.map((w, i) => (
            <button
              key={w}
              type="button"
              onClick={() => toggleWeekday(i)}
              title={`Ay boyu bütün "${w}" günlərini seç`}
              className="rounded-md py-1 text-center text-[11px] font-medium uppercase tracking-wide text-ink-soft transition-colors hover:bg-teal/10 hover:text-teal"
            >
              {w}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, i) => {
            if (!key) return <span key={`pad-${i}`} />;
            const day = Number(key.slice(-2));
            const isPast = key < todayKey;
            const isSel = selectedDays.has(key);
            const openCount = existing.get(key) ?? 0;

            return (
              <button
                key={key}
                type="button"
                disabled={isPast}
                onClick={() => toggleDay(key)}
                aria-pressed={isSel}
                className={[
                  "relative aspect-square rounded-lg text-sm transition-colors",
                  isSel
                    ? "bg-teal font-semibold text-porcelain"
                    : isPast
                      ? "cursor-not-allowed text-ink-soft/30"
                      : "border border-mist text-ink hover:border-teal hover:text-teal",
                ].join(" ")}
              >
                {day}
                {openCount > 0 && !isSel && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-pulse" /> artıq açıq slot var
          </span>
          <span>Həftə gününə klik → ay boyu təkrarlanır</span>
        </div>
      </div>

      {/* ---- Settings ---- */}
      <div className="space-y-5">
        <div>
          <p className="eyebrow mb-3">Saat aralığı</p>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              step={1800}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm outline-none focus:border-teal"
            />
            <span className="text-ink-soft">—</span>
            <input
              type="time"
              value={endTime}
              step={1800}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm outline-none focus:border-teal"
            />
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Gündə {times.length} slot × {SLOT_MINUTES} dəq · Azərbaycan vaxtı
          </p>
        </div>

        {/* Recurrence */}
        <div>
          <p className="eyebrow mb-3">Təkrarlanma</p>
          <select
            value={repeatMode}
            onChange={(e) => setRepeatMode(e.target.value as RepeatMode)}
            className="w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          >
            {(Object.keys(REPEAT_LABEL) as RepeatMode[]).map((m) => (
              <option key={m} value={m}>
                {REPEAT_LABEL[m]}
              </option>
            ))}
          </select>

          {repeatMode !== "none" && (
            <label className="mt-2 block text-xs text-ink-soft">
              Neçə dəfə (maks. {REPEAT_MAX[repeatMode]})
              <input
                type="number"
                min={1}
                max={REPEAT_MAX[repeatMode]}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
              />
            </label>
          )}
        </div>

        <div className="rounded-xl border border-mist bg-porcelain-2 p-4 text-sm">
          <p className="text-ink-soft">Seçilmiş gün: <strong className="text-ink">{selectedDays.size}</strong></p>
          {repeatMode !== "none" && (
            <p className="mt-1 text-ink-soft">
              Təkrar: <strong className="text-ink">{REPEAT_LABEL[repeatMode].toLowerCase()} × {repeats}</strong>
            </p>
          )}
          <p className="mt-1 text-ink-soft">
            Yaradılacaq slot: <strong className="text-teal">{total}</strong>
          </p>
        </div>

        {msg && <p className="text-sm text-teal">{msg}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={total === 0 || busy || times.length === 0}
            className="rounded-xl bg-teal px-5 py-2.5 font-medium text-porcelain transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Əlavə olunur…" : "Slotları əlavə et"}
          </button>
          {selectedDays.size > 0 && (
            <button
              type="button"
              onClick={() => setSelectedDays(new Set())}
              className="rounded-xl border border-mist px-5 py-2.5 text-sm text-ink transition-colors hover:border-teal hover:text-teal"
            >
              Seçimi təmizlə
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
