import type { Metadata } from "next";
import Link from "next/link";
import { PulseMark } from "@/components/pulse-mark";
import { BookingButton } from "@/components/booking-button";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema, breadcrumbSchema } from "@/lib/schema";
import { CONTACT, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kardioloq ilə əlaqə",
  description:
    "Kardioloq Dr. Kənan Əhmədov ilə əlaqə — telefon, e-poçt və ünvan. Onlayn randevu üçün keçid.",
  alternates: { canonical: "/elaqe" },
};

const HOURS = [
  { day: "Bazar ertəsi — Cümə", time: "09:00 — 18:00" },
  { day: "Şənbə", time: "10:00 — 14:00" },
  { day: "Bazar", time: "İstirahət" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <JsonLd
        data={[
          organizationSchema(),
          breadcrumbSchema([
            { name: "Ana səhifə", url: "/" },
            { name: "Əlaqə", url: "/elaqe" },
          ]),
        ]}
      />

      <p className="eyebrow">Əlaqə</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Bizimlə əlaqə saxlayın
      </h1>
      <PulseMark className="mt-5 h-5 w-52 text-pulse" />

      <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-mist bg-mist md:grid-cols-3">
        <div className="bg-porcelain p-7">
          <h2 className="eyebrow mb-4">Əlaqə məlumatı</h2>
          <ul className="space-y-3 text-ink">
            <li>
              <a href={CONTACT.phoneHref} className="hover:text-teal">
                {CONTACT.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT.email}`} className="hover:text-teal">
                {CONTACT.email}
              </a>
            </li>
            <li className="text-ink-soft">{CONTACT.address}</li>
          </ul>
        </div>

        <div className="bg-porcelain p-7">
          <h2 className="eyebrow mb-4">İş saatları</h2>
          <ul className="space-y-3 text-sm">
            {HOURS.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span className="text-ink-soft">{h.day}</span>
                <span className="text-ink">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-porcelain p-7">
          <h2 className="eyebrow mb-4">Onlayn randevu</h2>
          <p className="text-sm text-ink-soft">
            Video konsultasiya və ya kabinet qəbulu üçün uyğun vaxtı onlayn seçin.
          </p>
          <BookingButton className="mt-5 rounded-xl bg-teal px-5 py-2.5 text-sm font-medium text-porcelain hover:bg-teal-deep" />
        </div>
      </div>

      <p className="mt-8 flex flex-wrap items-center gap-x-2 rounded-xl border border-pulse/25 bg-pulse/5 px-4 py-3 text-sm text-ink-soft">
        <span className="font-medium text-pulse">Təcili hallar üçün deyil.</span>
        Həyati təhlükə zamanı dərhal{" "}
        <a href={`tel:${CONTACT.emergency}`} className="font-semibold text-pulse underline">
          {CONTACT.emergency}
        </a>{" "}
        nömrəsinə zəng edin.
      </p>
    </div>
  );
}
