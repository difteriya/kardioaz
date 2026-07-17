import type { Metadata } from "next";
import Image from "next/image";
import { BookingForm } from "@/components/booking-form";
import { PulseMark } from "@/components/pulse-mark";
import { CONTACT, DOCTOR, PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Randevu al",
  description: "Onlayn video konsultasiya üçün uyğun vaxtı seçin.",
  robots: { index: false, follow: false },
};

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-14">
      <p className="eyebrow">Onlayn konsultasiya</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Randevu al
      </h1>
      <PulseMark className="mt-5 h-5 w-52 text-pulse" />

      {/* Who the patient will actually be meeting — a face lowers the barrier
          to booking a video call with a stranger. */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-mist bg-porcelain-2/60 p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={PHOTOS.hero.src}
            alt={DOCTOR.name}
            fill
            sizes="64px"
            className="object-cover"
            style={{ objectPosition: PHOTOS.hero.focus }}
          />
        </div>
        <div>
          <p className="font-medium text-ink">{DOCTOR.name}</p>
          <p className="text-sm text-ink-soft">{DOCTOR.credentials}</p>
        </div>
      </div>

      <p className="mt-6 text-lg text-ink-soft">
        Boş vaxtlardan birini seçin. Təsdiq üçün e-poçtunuza keçid göndəriləcək.
      </p>

      <p className="mt-6 flex flex-wrap items-center gap-x-2 rounded-xl border border-pulse/25 bg-pulse/5 px-4 py-3 text-sm text-ink-soft">
        <span className="font-medium text-pulse">Təcili hallar üçün deyil.</span>
        Həyati təhlükə zamanı dərhal{" "}
        <a href={`tel:${CONTACT.emergency}`} className="font-semibold text-pulse underline">
          {CONTACT.emergency}
        </a>
        .
      </p>

      <div className="mt-10">
        <BookingForm />
      </div>
    </div>
  );
}
