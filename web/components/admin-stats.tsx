"use client";

import { useEffect, useState } from "react";

interface Stats {
  uniquePatients: number;
  returningPatients: number;
  booked: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  thisMonth: { booked: number; completed: number; cancelled: number };
}

/** Usage tiles. Numbers come from aggregate counters — never patient data. */
export function AdminStats({ refreshKey }: { refreshKey?: number }) {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setS(d.stats))
      .catch(() => {});
  }, [refreshKey]);

  if (!s) return <p className="text-ink-soft">Statistika yüklənir…</p>;

  const tiles: { label: string; value: number | string; hint?: string }[] = [
    { label: "unikal pasiyent", value: s.uniquePatients, hint: `${s.returningPatients} təkrar` },
    { label: "tamamlanmış görüş", value: s.completed, hint: `bu ay ${s.thisMonth.completed}` },
    { label: "yaxınlaşan randevu", value: s.upcoming },
    { label: "ümumi randevu", value: s.booked, hint: `bu ay ${s.thisMonth.booked}` },
    { label: "ləğv edilmiş", value: s.cancelled, hint: `bu ay ${s.thisMonth.cancelled}` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.label} className="card px-4 py-5 text-center">
          <p className="font-display text-3xl font-semibold text-ink">{t.value}</p>
          <p className="eyebrow mt-2 text-ink-soft">{t.label}</p>
          {t.hint && <p className="mt-1 text-xs text-ink-soft/70">{t.hint}</p>}
        </div>
      ))}
    </div>
  );
}
