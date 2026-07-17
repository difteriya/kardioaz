"use client";

import { useEffect, useMemo, useState } from "react";
import { AZ_MONTHS, AZ_WEEKDAYS, azDateKey, azTime, dateKey } from "@/lib/booking/config";

export interface Slot {
  id: string;
  start_at: string;
}

/** Azerbaijani capitalisation — "iyul" → "İyul" (dotted capital İ). */
const cap = (s: string) => s.charAt(0).toLocaleUpperCase("az") + s.slice(1);

export function BookingCalendar({
  slots,
  selected,
  onSelect,
}: {
  slots: Slot[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  // Group slots by Azerbaijan calendar day.
  const byDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = azDateKey(s.start_at);
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.start_at.localeCompare(b.start_at));
    return map;
  }, [slots]);

  const availableDays = useMemo(() => [...byDate.keys()].sort(), [byDate]);
  const todayKey = useMemo(() => azDateKey(new Date().toISOString()), []);

  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const [y, m] = todayKey.split("-").map(Number);
    return { y, m: m - 1 };
  });

  // Once slots load, jump to the first day that actually has availability.
  useEffect(() => {
    if (!activeDate && availableDays.length > 0) {
      const first = availableDays[0];
      setActiveDate(first);
      const [y, m] = first.split("-").map(Number);
      setCursor({ y, m: m - 1 });
    }
  }, [availableDays, activeDate]);

  const cells = useMemo(() => {
    const firstWeekday = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // Monday = 0
    const dayCount = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const out: (string | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= dayCount; d++) out.push(dateKey(cursor.y, cursor.m, d));
    return out;
  }, [cursor]);

  const canGoPrev = useMemo(() => {
    const [ty, tm] = todayKey.split("-").map(Number);
    return cursor.y > ty || (cursor.y === ty && cursor.m > tm - 1);
  }, [cursor, todayKey]);

  function shiftMonth(delta: number) {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  }

  function pickDay(key: string) {
    setActiveDate(key);
    onSelect(null); // clear any time chosen on a previous day
  }

  const times = activeDate ? byDate.get(activeDate) ?? [] : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
      {/* ---- Month calendar ---- */}
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

        <div className="mt-5 grid grid-cols-7 gap-1">
          {AZ_WEEKDAYS.map((w) => (
            <span key={w} className="pb-1 text-center text-[11px] font-medium uppercase tracking-wide text-ink-soft">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((key, i) => {
            if (!key) return <span key={`pad-${i}`} />;
            const day = Number(key.slice(-2));
            const has = byDate.has(key);
            const isPast = key < todayKey;
            const isActive = key === activeDate;
            const isToday = key === todayKey;
            const disabled = !has || isPast;

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => pickDay(key)}
                aria-pressed={isActive}
                className={[
                  "relative aspect-square rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-teal font-semibold text-porcelain"
                    : disabled
                      ? "cursor-not-allowed text-ink-soft/30"
                      : "border border-mist text-ink hover:border-teal hover:text-teal",
                  !isActive && isToday ? "ring-1 ring-pulse/40" : "",
                ].join(" ")}
              >
                {day}
                {has && !isActive && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-teal" />
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          boş vaxt var · Azərbaycan vaxtı (UTC+4)
        </p>
      </div>

      {/* ---- Times for the chosen day ---- */}
      <div>
        <p className="eyebrow mb-3">Saat seçin</p>
        {times.length === 0 ? (
          <p className="rounded-xl border border-mist bg-porcelain-2 p-4 text-sm text-ink-soft">
            {availableDays.length === 0
              ? "Hazırda boş vaxt yoxdur."
              : "Bu gün üçün boş vaxt yoxdur."}
          </p>
        ) : (
          <div className="grid max-h-[320px] grid-cols-2 gap-2 overflow-y-auto pr-1 lg:grid-cols-1">
            {times.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={
                  selected === s.id
                    ? "rounded-xl bg-teal px-4 py-2.5 text-sm font-medium text-porcelain shadow-soft"
                    : "rounded-xl border border-mist px-4 py-2.5 text-sm text-ink transition-colors hover:border-teal hover:text-teal"
                }
              >
                {azTime(s.start_at)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
