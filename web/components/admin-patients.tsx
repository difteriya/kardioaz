"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { formatSlotAz, AZ_MONTHS, AZ_TZ } from "@/lib/booking/config";

interface Patient {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  appointments: { id: string; startAt: string; status: string }[];
}

const STATUS_AZ: Record<string, string> = {
  pending: "Gözləyir",
  booked: "Təsdiqlənib",
  completed: "Tamamlanıb",
  cancelled: "Ləğv edilib",
  no_show: "Gəlmədi",
};

/** "14 iyul 2026" in Baku time. */
function shortDateAz(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AZ_TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return `${get("day")} ${AZ_MONTHS[get("month") - 1]} ${get("year")}`;
}

/** Patient directory — who booked, how often, and when they were last seen. */
export function AdminPatients({ refreshKey }: { refreshKey?: number }) {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  /** id of the row being edited, plus its draft values. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/patients");
      const d = await r.json().catch(() => ({}));
      setPatients(d.patients ?? []);
    } catch {
      setPatients([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients ?? [];
    // Match name/phone too — digits-only so "0501234567" finds "+994501234567".
    const qDigits = q.replace(/\D/g, "");
    return (patients ?? []).filter(
      (p) =>
        p.email.toLowerCase().includes(q) ||
        p.fullName?.toLowerCase().includes(q) ||
        (qDigits.length >= 3 && p.phone?.replace(/\D/g, "").includes(qDigits)),
    );
  }, [patients, query]);

  function startEdit(p: Patient) {
    setErr(null);
    setEditing(p.id);
    setDraft({ fullName: p.fullName ?? "", phone: p.phone ?? "" });
  }

  async function save(id: string) {
    setSaving(true);
    setErr(null);
    const res = await fetch("/api/admin/patients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fullName: draft.fullName, phone: draft.phone }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      // Patch in place — the server returns the normalised values it stored.
      setPatients(
        (prev) =>
          prev?.map((p) =>
            p.id === id ? { ...p, fullName: d.fullName, phone: d.phone } : p,
          ) ?? null,
      );
      setEditing(null);
    } else {
      setErr(d.error ?? "Yadda saxlanmadı.");
    }
  }

  async function remove(p: Patient) {
    if (!confirm(`${p.email} siyahıdan həmişəlik silinsin?`)) return;
    setErr(null);
    const res = await fetch("/api/admin/patients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    if (res.ok) load();
    else setErr("Silinmə alınmadı.");
  }

  if (patients === null) return <p className="text-ink-soft">Yüklənir…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ad, e-poçt və ya nömrə üzrə axtar…"
          className="w-full max-w-xs rounded-xl border border-mist bg-porcelain px-4 py-2 text-sm text-ink outline-none focus:border-teal"
        />
        <div className="flex items-center gap-4">
          <p className="text-sm text-ink-soft">
            {shown.length} pasiyent
            {patients.some((p) => p.visitCount > 1) && (
              <> · {patients.filter((p) => p.visitCount > 1).length} təkrar</>
            )}
          </p>
          {/* Plain links: the browser downloads them, no blob juggling needed.
              Excel is the default — a CSV cannot state its encoding, so Excel
              guesses CP1252 and mangles Azerbaijani letters. */}
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/patients/export"
              download
              className="inline-flex items-center gap-2 rounded-xl border border-mist px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-porcelain-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 1.5v8.5M8 10l3-3M8 10L5 7M2 11.5v2h12v-2" />
              </svg>
              Excel yüklə
            </a>
            <a
              href="/api/admin/patients/export?format=csv"
              download
              title="Proqram/idxal üçün xam CSV (UTF-8)"
              className="rounded-xl px-2 py-2 text-xs font-medium text-ink-soft transition-colors hover:text-ink hover:underline"
            >
              CSV
            </a>
          </div>
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-pulse">{err}</p>}

      {shown.length === 0 ? (
        <p className="mt-4 text-ink-soft">
          {query ? "Uyğun pasiyent tapılmadı." : "Hələ pasiyent yoxdur."}
        </p>
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-mist shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-porcelain-2 text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Pasiyent</th>
                <th className="px-4 py-3 font-medium">Əlaqə</th>
                <th className="px-4 py-3 font-medium">Görüş sayı</th>
                <th className="px-4 py-3 font-medium">İlk dəfə</th>
                <th className="px-4 py-3 font-medium">Son dəfə</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-mist bg-porcelain">
              {shown.map((p) => {
                const isOpen = open === p.id;
                const isEditing = editing === p.id;
                return (
                  <Fragment key={p.id}>
                    <tr className={isEditing ? "bg-teal/[0.04]" : undefined}>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.fullName}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, fullName: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") save(p.id);
                              if (e.key === "Escape") setEditing(null);
                            }}
                            placeholder="Ad və soyad"
                            autoFocus
                            className="w-44 rounded-lg border border-mist bg-porcelain px-2.5 py-1.5 text-sm text-ink outline-none focus:border-teal"
                          />
                        ) : (
                          <>
                            <span className="text-ink">
                              {p.fullName ?? (
                                <span className="text-ink-soft/60">Ad qeyd edilməyib</span>
                              )}
                            </span>
                            {p.visitCount > 1 && (
                              <span className="ml-2 whitespace-nowrap rounded-full bg-teal/10 px-2 py-0.5 text-xs font-medium text-teal">
                                Təkrar
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        <span className="block">{p.email}</span>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={draft.phone}
                            onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") save(p.id);
                              if (e.key === "Escape") setEditing(null);
                            }}
                            placeholder="+994 50 123 45 67"
                            className="mt-1 w-44 rounded-lg border border-mist bg-porcelain px-2.5 py-1.5 text-sm text-ink outline-none focus:border-teal"
                          />
                        ) : (
                          p.phone && (
                            <a
                              href={`tel:${p.phone}`}
                              className="block text-xs text-teal hover:underline"
                            >
                              {p.phone}
                            </a>
                          )
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{p.visitCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                        {shortDateAz(p.firstSeen)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                        {shortDateAz(p.lastSeen)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => save(p.id)}
                                disabled={saving}
                                className="whitespace-nowrap rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-porcelain transition-colors hover:bg-teal-deep disabled:opacity-50"
                              >
                                {saving ? "Yadda saxlanır…" : "Yadda saxla"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="rounded-lg border border-mist px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-porcelain-2"
                              >
                                İmtina
                              </button>
                            </>
                          ) : (
                            <>
                              {p.appointments.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setOpen(isOpen ? null : p.id)}
                                  className="whitespace-nowrap rounded-lg border border-mist px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-porcelain-2"
                                >
                                  {isOpen ? "Gizlət" : `Randevular (${p.appointments.length})`}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => startEdit(p)}
                                className="rounded-lg border border-mist px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-porcelain-2"
                              >
                                Redaktə
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(p)}
                                className="rounded-lg border border-pulse/40 px-3 py-1.5 text-xs font-medium text-pulse transition-colors hover:bg-pulse/10"
                              >
                                Sil
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-porcelain-2/50">
                        <td colSpan={6} className="px-4 py-3">
                          <ul className="space-y-1.5">
                            {p.appointments.map((a) => (
                              <li key={a.id} className="flex items-center gap-3 text-xs">
                                <span className="text-ink">{formatSlotAz(a.startAt)}</span>
                                <span className="text-ink-soft">
                                  {STATUS_AZ[a.status] ?? a.status}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
