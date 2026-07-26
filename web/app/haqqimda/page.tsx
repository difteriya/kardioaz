import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PulseMark } from "@/components/pulse-mark";
import { BookingButton } from "@/components/booking-button";
import { JsonLd } from "@/components/json-ld";
import { physicianSchema, breadcrumbSchema } from "@/lib/schema";
import { DOCTOR, SITE, PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kardioloq Dr. Kənan Əhmədov haqqında",
  description: `${DOCTOR.name} (${DOCTOR.nameAscii}) — invaziv kardioloq. 2003-cü ildən təcrübə; Azərbaycan, Avstriya və Almaniyada ixtisas. Təhsil, karyera və beynəlxalq təlimlər.`,
  alternates: { canonical: "/haqqimda" },
};

// Full career (İş və praktiki fəaliyyəti) — from kardio.az/about
const EXPERIENCE = [
  { period: "2003", title: "Azərbaycan Tibb Universitetini bitirib", place: "Bakı" },
  { period: "2003 — 2004", title: "Həkim-intern", place: "Elmi-Tədqiqat Kardiologiya İnstitutu" },
  {
    period: "2004 — 2007",
    title: "İntensiv terapiya həkimi və kardioloq",
    place: "Bakı Baş Təcili Yardım Stansiyası (9N-li KYS)",
  },
  {
    period: "2004 — 2007",
    title: "Növbətçi intensiv terapiya həkimi",
    place: "MediClub Klinikası",
  },
  { period: "2006 — 2009", title: "Həkim-aspirant", place: "Həkimləri Təkmilləşdirmə İnstitutu" },
  {
    period: "2009 — 2013",
    title: "Təcili yardım və qəbul şöbəsi həkimi",
    place: "Mərkəzi Klinika MMC",
  },
  { period: "2013 — 2019", title: "Kardioloq", place: "Mərkəzi Klinika MMC" },
  { period: "2019 — 2020", title: "Kardioloq", place: "Klinikum Bad Hersfeld, Almaniya" },
  { period: "2020 — cari", title: "İnvaziv kardioloq", place: "Mərkəzi Klinika MMC" },
];

// International trainings/fellowships — from kardio.az/about
const TRAINING = [
  { period: "2009", title: "Kardioreanimasiya", place: "Allgemeines Krankenhaus (AKH), Vyana" },
  { period: "2010", title: "Ümumi kardiologiya", place: "Allgemeines Krankenhaus (AKH), Vyana" },
  { period: "2011", title: "Exokardioqrafiya və kardiologiya", place: "Allgemeines Krankenhaus (AKH), Vyana" },
  { period: "2019", title: "Exokardioqrafiya və kardiologiya", place: "Klinikum Nord Bremen, Almaniya" },
  { period: "2023", title: "İnvaziv kardiologiya", place: "Cardioangiological Center Bethanien, Frankfurt" },
];

// Diseases treated (Müalicə etdiyi xəstəliklər)
const TREATS = [
  "Ürək-damar xəstəlikləri",
  "Yüksək qan təzyiqi (hipertoniya)",
  "Ürək çatışmazlığı",
  "Ürək qapaq xəstəlikləri",
  "Müxtəlif aritmiyalar",
];

// Why us (Niyə biz?)
const WHY = [
  {
    title: "Müasir texnologiya",
    desc: "Ən son tibbi texnologiyaları tətbiq edərək yüksək dəqiqliklə diaqnostika və müalicə imkanları yaradırıq.",
  },
  {
    title: "Sertifikatlı mütəxəssis",
    desc: "Dünya səviyyəli sertifikasiyalar və sahədə geniş beynəlxalq təcrübə.",
  },
  {
    title: "Yüzlərlə sağlam ürək",
    desc: "Hər il yüzlərlə xəstə sağlamlığına qovuşur — ürəyinizi qorumaq üçün müasir həllər.",
  },
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-6xl px-5 pt-14">
      <JsonLd
        data={[
          physicianSchema(),
          breadcrumbSchema([
            { name: "Ana səhifə", url: "/" },
            { name: "Haqqımda", url: "/haqqimda" },
          ]),
        ]}
      />

      <p className="eyebrow eyebrow-tick">Haqqımda</p>
      <div className="mt-4 grid gap-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-mist bg-gradient-to-b from-porcelain-2 to-mist-soft shadow-soft">
            <Image
              src={PHOTOS.portrait.src}
              alt={`${DOCTOR.name} — ${DOCTOR.title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover"
              style={{ objectPosition: PHOTOS.portrait.focus }}
            />
          </div>

          {/* Second image: the cath lab is where the "invaziv kardioloq" claim
              actually lives — showing it is E-E-A-T evidence, not decoration. */}
          <figure className="mt-5 max-w-sm">
            {/* 4:5, not 4:3 — a portrait source in a landscape frame loses the
                head. Keep frames near the source ratio and trim with focus. */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-mist shadow-soft">
              <Image
                src={PHOTOS.cathLab.src}
                alt={`${DOCTOR.name} anqioqrafiya kabinetində — Mərkəzi Klinika`}
                fill
                sizes="(max-width: 1024px) 100vw, 400px"
                className="object-cover"
                style={{ objectPosition: PHOTOS.cathLab.focus }}
              />
            </div>
            <figcaption className="mt-2 text-sm text-ink-soft">
              Anqioqrafiya kabineti — Mərkəzi Klinika, Bakı.
            </figcaption>
          </figure>
        </div>

        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {DOCTOR.name}
          </h1>
          <p className="mt-2 text-teal">{DOCTOR.credentials}</p>
          <PulseMark className="mt-5 h-5 w-52 text-pulse" />

          <div className="mt-7 space-y-4 text-lg leading-relaxed text-ink-soft">
            <p>
              Artıq 15 ilə yaxındır ki, kardiovaskulyar xəstəliklər üzrə mütəxəssis və
              invaziv kardioloq kimi çalışır. 2003-cü ildə Azərbaycan Tibb Universitetini
              bitirdikdən sonra Azərbaycan, Avstriya, Türkiyə və Almaniyada çoxsaylı
              ixtisasartırma kurslarında iştirak edib.
            </p>
            <p>
              Hal-hazırda o və komandası kardiologiyanın ən müasir müalicə və diaqnostika
              metodlarından istifadə edərək çoxsaylı xəstələrin etimadını qazanıb.
            </p>
          </div>

          <h2 className="mt-10 font-display text-2xl font-semibold text-ink">
            Müalicə etdiyi xəstəliklər
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {TREATS.map((t) => (
              <li
                key={t}
                className="rounded-full border border-mist bg-porcelain px-4 py-1.5 text-sm text-ink-soft shadow-soft"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Why us */}
      <section className="mt-16">
        <p className="eyebrow eyebrow-tick">Niyə biz?</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Tibb sektoruna yenilikçi damğamızı vururuq
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="card flex flex-col gap-3 p-7">
              <PulseMark className="h-2.5 w-11 text-pulse/70" />
              <h3 className="font-display text-lg font-semibold text-ink">{w.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education & career */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-ink">İş və praktiki fəaliyyəti</h2>
        <ol className="mt-6 overflow-hidden rounded-2xl border border-mist shadow-soft">
          {EXPERIENCE.map((e, i) => (
            <li
              key={`${e.period}-${i}`}
              className="grid gap-1 border-b border-mist bg-porcelain px-6 py-5 last:border-b-0 sm:grid-cols-[200px_1fr]"
            >
              <span className="eyebrow text-ink-soft">{e.period}</span>
              <span>
                <span className="font-medium text-ink">{e.title}</span>
                <span className="block text-sm text-ink-soft">{e.place}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* International training */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Beynəlxalq təlim və təcrübə
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRAINING.map((t, i) => (
            <div key={`${t.period}-${i}`} className="card flex flex-col gap-2 p-6">
              <span className="eyebrow text-teal">{t.period}</span>
              <h3 className="font-display text-base font-semibold leading-snug text-ink">
                {t.title}
              </h3>
              <p className="text-sm text-ink-soft">{t.place}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <BookingButton className="rounded-xl bg-teal px-6 py-3 font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg" />
        <Link
          href="/xidmetler"
          className="rounded-xl border border-mist px-6 py-3 font-medium text-ink transition-colors hover:border-teal hover:text-teal"
        >
          Xidmətlər
        </Link>
      </div>
    </article>
  );
}
