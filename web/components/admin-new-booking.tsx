"use client";

import { useCallback, useEffect, useState } from "react";
import { formatSlotAz } from "@/lib/booking/config";

interface Slot {
  id: string;
  start_at: string;
}

/**
 * Doctor books a patient in directly (e.g. they phoned in). This skips the
 * email double opt-in — the doctor's action IS the confirmation — so the
 * appointment is created already `booked`, with the room and both emails sent.
 */
export function AdminNewBooking({ onCreated }: { onCreated?: () => void }) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotId, setSlotId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/availability");
      const d = await r.json();
      setSlots(d.slots ?? []);
    } catch {
      setSlots([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const valid = slotId && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/appointments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, email, fullName, phone }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg("Randevu yaradıldı və təsdiqləndi. E-poçt göndərildi.");
        setSlotId("");
        setEmail("");
        setFullName("");
        setPhone("");
        await load();
        onCreated?.();
      } else {
        setErr(d.error ?? "Xəta baş verdi.");
        await load();
      }
    } catch {
      setErr("Şəbəkə xətası.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <p className="text-sm text-ink-soft">
        Pasiyent telefonla müraciət edibsə, randevunu birbaşa siz yarada bilərsiniz —
        e-poçt təsdiqi tələb olunmur, randevu dərhal təsdiqlənmiş sayılır.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <label className="text-sm">
          <span className="block text-ink-soft">Boş vaxt</span>
          <select
            value={slotId}
            onChange={(e) => setSlotId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          >
            <option value="">
              {slots === null
                ? "Yüklənir…"
                : slots.length === 0
                  ? "Boş vaxt yoxdur"
                  : "Vaxt seçin"}
            </option>
            {(slots ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {formatSlotAz(s.start_at)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="block text-ink-soft">Pasiyentin e-poçtu</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@email.com"
            className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          />
        </label>

        <label className="text-sm">
          <span className="block text-ink-soft">Ad və soyad</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="(istəyə bağlı)"
            className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          />
        </label>

        <label className="text-sm">
          <span className="block text-ink-soft">Mobil nömrə</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(istəyə bağlı)"
            className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-3 py-2 text-sm text-ink outline-none focus:border-teal"
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!valid || busy}
          className="self-end rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-porcelain transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Yaradılır…" : "Randevu yarat"}
        </button>
      </div>

      {msg && <p className="mt-3 text-sm text-teal">{msg}</p>}
      {err && <p className="mt-3 text-sm text-pulse">{err}</p>}
    </div>
  );
}
