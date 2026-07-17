"use client";

import { useCallback, useEffect, useState } from "react";
import { formatSlotAz } from "@/lib/booking/config";
import { joinWindow, countdownAz, JOIN_EARLY_MINUTES } from "@/lib/booking/join-window";
import { AdminSlotCalendar } from "./admin-slot-calendar";
import { AdminStats } from "./admin-stats";
import { AdminNewBooking } from "./admin-new-booking";
import { AdminPatients } from "./admin-patients";

interface Appt {
  id: string;
  patient_email: string;
  full_name: string | null;
  phone: string | null;
  status: string;
  start_at: string;
}

const TABS = [
  { key: "icmal", label: "İcmal" },
  { key: "randevular", label: "Randevular" },
  { key: "pasiyentler", label: "Pasiyentlər" },
  { key: "cedvel", label: "Cədvəl" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_AZ: Record<string, string> = {
  pending: "Gözləyir",
  booked: "Təsdiqlənib",
  completed: "Tamamlanıb",
  cancelled: "Ləğv edilib",
  no_show: "Gəlmədi",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-porcelain-2 text-ink-soft",
  booked: "bg-teal/10 text-teal",
  completed: "bg-porcelain-2 text-ink-soft",
  cancelled: "bg-pulse/10 text-pulse",
  no_show: "bg-pulse/10 text-pulse",
};

export function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState<Appt[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("icmal");
  /** Bumped after any change so the stats tiles refetch. */
  const [refreshKey, setRefreshKey] = useState(0);
  /** Ticks so "Otağa qoşul" turns itself on when the window opens. */
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const loadAppointments = useCallback(async () => {
    const res = await fetch("/api/admin/appointments");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const d = await res.json().catch(() => ({}));
    setAppointments(d.appointments ?? []);
    setAuthed(true);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function login() {
    setMsg(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setPassword("");
      loadAppointments();
    } else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "Giriş alınmadı.");
    }
  }

  async function accept(id: string) {
    setMsg(null);
    const res = await fetch("/api/admin/appointments/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    if (res.ok) loadAppointments();
    else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "Qəbul alınmadı.");
    }
  }

  /** Decline = doctor-side cancel: frees the slot and emails the patient. */
  async function decline(id: string) {
    setMsg(null);
    const res = await fetch("/api/appointments/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id }),
    });
    if (res.ok) loadAppointments();
    else {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error ?? "İmtina alınmadı.");
    }
  }

  if (authed === null) return <p className="text-ink-soft">Yüklənir…</p>;

  if (!authed) {
    return (
      <div className="card max-w-sm p-6">
        <h2 className="font-display text-xl font-semibold text-ink">Giriş</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="Admin parolu"
          className="mt-4 w-full rounded-xl border border-mist bg-porcelain px-4 py-2.5 outline-none focus:border-teal"
        />
        {msg && <p className="mt-3 text-sm text-pulse">{msg}</p>}
        <button
          type="button"
          onClick={login}
          className="mt-4 w-full rounded-xl bg-teal px-4 py-2.5 font-medium text-porcelain hover:bg-teal-deep"
        >
          Daxil ol
        </button>
      </div>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div>
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Həkim paneli bölmələri"
        className="flex flex-wrap gap-1 border-b border-mist"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={active}
              aria-controls={`panel-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`-mb-px rounded-t-xl border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "border-teal text-teal"
                  : "border-transparent text-ink-soft hover:bg-porcelain-2 hover:text-ink"
              }`}
            >
              {t.label}
              {t.key === "randevular" && pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-pulse px-1.5 py-0.5 text-[0.65rem] font-semibold text-porcelain">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="pt-8"
      >
        {tab === "icmal" && (
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">İstifadə</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Rəqəmlər konsultasiya silindikdən sonra da qalır.
            </p>
            <div className="mt-6">
              <AdminStats refreshKey={refreshKey} />
            </div>
          </section>
        )}

        {tab === "pasiyentler" && (
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">Pasiyent siyahısı</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Təkrar müraciət edən pasiyentlər «Təkrar» nişanı ilə görünür.
            </p>
            <div className="mt-6">
              <AdminPatients refreshKey={refreshKey} />
            </div>
          </section>
        )}

        {tab === "cedvel" && (
          <div className="space-y-14">
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">Boş vaxt əlavə et</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Günləri seçin — həftə gününə klikləsəniz ay boyu təkrarlanır.
              </p>
              <div className="mt-6">
                <AdminSlotCalendar onCreated={loadAppointments} />
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Pasiyent üçün randevu yarat
              </h2>
              <div className="mt-6">
                <AdminNewBooking onCreated={loadAppointments} />
              </div>
            </section>
          </div>
        )}

        {tab === "randevular" && (
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">Randevular</h2>
            {msg && <p className="mt-3 text-sm text-pulse">{msg}</p>}
            {appointments.length === 0 ? (
              <p className="mt-4 text-ink-soft">Hələ randevu yoxdur.</p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-mist shadow-soft">
                <table className="w-full text-left text-sm">
                  <thead className="bg-porcelain-2 text-ink-soft">
                    <tr>
                      <th className="px-4 py-3 font-medium">Vaxt</th>
                      <th className="px-4 py-3 font-medium">Pasiyent</th>
                      <th className="px-4 py-3 font-medium">Əlaqə</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mist bg-porcelain">
                    {appointments.map((a) => (
                      <tr key={a.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">
                          {formatSlotAz(a.start_at)}
                        </td>
                        <td className="px-4 py-3 text-ink">
                          {a.full_name ?? <span className="text-ink-soft/60">—</span>}
                        </td>
                        <td className="px-4 py-3 text-ink-soft">
                          <span className="block">{a.patient_email}</span>
                          {a.phone && (
                            <a
                              href={`tel:${a.phone}`}
                              className="block text-xs text-teal hover:underline"
                            >
                              {a.phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                              STATUS_STYLE[a.status] ?? "bg-porcelain-2 text-ink-soft"
                            }`}
                          >
                            {STATUS_AZ[a.status] ?? a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {a.status === "booked" &&
                              (joinWindow(a.start_at, now).state === "open" ? (
                                <a
                                  href={`/konsultasiya/${a.id}`}
                                  target="_blank"
                                  rel="noopener"
                                  className="whitespace-nowrap rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-porcelain transition-colors hover:bg-teal-deep"
                                >
                                  Otağa qoşul
                                </a>
                              ) : (
                                <span
                                  title={
                                    joinWindow(a.start_at, now).state === "early"
                                      ? `Otaq randevudan ${JOIN_EARLY_MINUTES} dəqiqə əvvəl açılır.`
                                      : "Bu konsultasiyanın vaxtı bitib."
                                  }
                                  className="whitespace-nowrap rounded-lg border border-mist px-3 py-1.5 text-xs font-medium text-ink-soft/60"
                                >
                                  {joinWindow(a.start_at, now).state === "early"
                                    ? `Açılır: ${countdownAz(joinWindow(a.start_at, now).opensAt - now)}`
                                    : "Vaxtı bitib"}
                                </span>
                              ))}
                            {a.status === "pending" && (
                              <button
                                type="button"
                                onClick={() => accept(a.id)}
                                className="whitespace-nowrap rounded-lg bg-teal px-3 py-1.5 text-xs font-medium text-porcelain transition-colors hover:bg-teal-deep"
                              >
                                Qəbul et
                              </button>
                            )}
                            {["pending", "booked"].includes(a.status) && (
                              <button
                                type="button"
                                onClick={() => decline(a.id)}
                                className="whitespace-nowrap rounded-lg border border-pulse/40 px-3 py-1.5 text-xs font-medium text-pulse transition-colors hover:bg-pulse/10"
                              >
                                İmtina et
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
