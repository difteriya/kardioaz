import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { PulseMark } from "@/components/pulse-mark";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { CONTACT, DOCTOR, PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Onlayn kardioloq konsultasiyası — randevu al",
  description:
    "Dr. Kənan Əhmədovla onlayn video kardioloq konsultasiyası. Uyğun vaxtı seçin, e-poçtla təsdiqləyin və evdən ürək məsləhəti alın. Necə işlədiyini və qaydaları öyrənin.",
  alternates: { canonical: "/randevu" },
};

const STEPS = [
  { t: "Boş vaxt seçin", d: "Təqvimdən sizə uyğun boş vaxtı seçin." },
  { t: "Məlumatları daxil edin", d: "Ad-soyad, mobil nömrə və e-poçt ünvanınızı yazın." },
  { t: "E-poçtu təsdiqləyin", d: "E-poçtunuza gələn keçidə 15 dəqiqə ərzində klikləyin." },
  { t: "Otaq linkini alın", d: "Təsdiqdən sonra konsultasiya otağının linki e-poçtunuza gəlir." },
  { t: "Qoşulun", d: "Otaq randevudan 5 dəqiqə əvvəl açılır — vaxtında qoşulun." },
];

const RULES = [
  "Otağa yalnız randevudan 5 dəqiqə əvvəl qoşulmaq mümkündür.",
  "Sabit internet, işlək kamera və mikrofon lazımdır (telefon və ya kompüter).",
  "Konsultasiyanı ləğv etmək üçün e-poçtdakı ləğv linkindən istifadə edin.",
  "Onlayn konsultasiya təcili və həyati təhlükəli hallar üçün nəzərdə tutulmayıb.",
];

const FAQ = [
  {
    question: "Onlayn kardioloq konsultasiyası necə keçir?",
    answer:
      "Konsultasiya video zəng vasitəsilə keçir. Təsdiqdən sonra e-poçtunuza gələn link ilə birbaşa brauzerdən otağa qoşulursunuz — əlavə proqram quraşdırmağa ehtiyac yoxdur.",
  },
  {
    question: "Onlayn konsultasiya üçün nə lazımdır?",
    answer:
      "Sabit internet bağlantısı, işlək kamera və mikrofonu olan telefon və ya kompüter kifayətdir.",
  },
  {
    question: "Randevuya nə vaxt qoşulmalıyam?",
    answer:
      "Konsultasiya otağı randevu vaxtından 5 dəqiqə əvvəl açılır. Vaxtında qoşulmağınız tövsiyə olunur.",
  },
  {
    question: "Təsdiq linki e-poçtuma gəlmədi, nə etməliyəm?",
    answer:
      "Əvvəlcə spam/junk qovluğunu yoxlayın. Təsdiq linki 15 dəqiqə etibarlıdır; müddət bitibsə, yenidən vaxt seçib randevu tuta bilərsiniz.",
  },
  {
    question: "Onlayn konsultasiya fiziki müayinəni əvəz edirmi?",
    answer:
      "Onlayn konsultasiya ilkin qiymətləndirmə, məsləhət və mövcud nəticələrin dəyərləndirilməsi üçün əlverişlidir, lakin bəzi hallarda tələb olunan fiziki müayinə və analizləri əvəz etmir.",
  },
  {
    question: "Randevunu necə ləğv edə və ya dəyişə bilərəm?",
    answer:
      "Təsdiq e-poçtundakı ləğv linkinə klikləməklə randevunu ləğv edə bilərsiniz. Ətraflı şərtlər üçün randevu siyasətinə baxın.",
  },
];

export default function BookingPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-14">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana səhifə", url: "/" },
            { name: "Randevu", url: "/randevu" },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <p className="eyebrow">Onlayn konsultasiya</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Onlayn kardioloq konsultasiyası
      </h1>
      <PulseMark className="mt-5 h-5 w-52 text-pulse" />

      {/* Who the patient will actually be meeting — a face lowers the barrier
          to booking a video call with a stranger. */}
      <div className="mt-8 flex items-center gap-4 rounded-2xl border border-mist bg-porcelain-2/60 p-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={PHOTOS.hero.src}
            alt={`${DOCTOR.name} — onlayn kardioloq konsultasiyası`}
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
        Evinizdən çıxmadan Dr. Kənan Əhmədovla video konsultasiya keçirin. Ürək
        şikayətlərinizi müzakirə edin, mövcud müayinə nəticələrinizi dəyərləndirin
        və peşəkar məsləhət alın. Aşağıda prosesin necə işlədiyini görə və birbaşa
        randevu tuta bilərsiniz.
      </p>

      <p className="mt-6 flex flex-wrap items-center gap-x-2 rounded-xl border border-pulse/25 bg-pulse/5 px-4 py-3 text-sm text-ink-soft">
        <span className="font-medium text-pulse">Təcili hallar üçün deyil.</span>
        Həyati təhlükə zamanı dərhal{" "}
        <a href={`tel:${CONTACT.emergency}`} className="font-semibold text-pulse underline">
          {CONTACT.emergency}
        </a>
        .
      </p>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Randevu necə işləyir?</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-2xl border border-mist bg-porcelain-2/40 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal font-display text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-ink">{s.t}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Booking form */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Boş vaxt seçin</h2>
        <p className="mt-3 text-ink-soft">
          Uyğun vaxtı seçin. Təsdiq üçün e-poçtunuza keçid göndəriləcək.
        </p>
        <div className="mt-8">
          <BookingForm />
        </div>
      </section>

      {/* Rules */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Randevu qaydaları</h2>
        <ul className="mt-5 space-y-3">
          {RULES.map((r) => (
            <li key={r} className="flex items-start gap-3 text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-ink-soft">
          Tam şərtlər üçün{" "}
          <Link href="/randevu-siyaseti" className="text-teal hover:underline">
            randevu siyasətinə
          </Link>{" "}
          baxın.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Tez-tez verilən suallar</h2>
        <dl className="mt-6 divide-y divide-mist overflow-hidden rounded-2xl border border-mist">
          {FAQ.map((f) => (
            <div key={f.question} className="p-5">
              <dt className="font-medium text-ink">{f.question}</dt>
              <dd className="mt-2 text-ink-soft">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
