import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PulseMark } from "@/components/pulse-mark";
import { VideoIcon } from "@/components/video-icon";
import { BookingButton } from "@/components/booking-button";
import { ConsultationCallout } from "@/components/consultation-callout";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { SITE, CONTACT, PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Xidmətlər",
  description:
    "Kardioloji xidmətlər: ürək diaqnostikası (EKQ, exokardioqrafiya, Holter, MRT), xəstəliklərin müalicəsi, invaziv kardiologiya (TAVİ, EVAR), onlayn konsultasiya və müayinələr.",
  alternates: { canonical: "/xidmetler" },
};

const AREAS = [
  {
    id: "diaqnostika",
    title: "Ürək diaqnostikası",
    photo: PHOTOS.desk,
    photoAlt: "Dr. Kənan Əhmədov müayinə nəticələrini dəyərləndirərkən",
    lead: "Düzgün müalicə dəqiq diaqnozla başlayır. Ürək-damar sisteminin vəziyyətini müasir cihazlarla hərtərəfli qiymətləndirir, problemi erkən mərhələdə aşkarlayırıq.",
    items: [
      { name: "EKQ (elektrokardioqrafiya)", desc: "Ürəyin elektrik aktivliyinin qeydə alınması." },
      { name: "Exokardioqrafiya", desc: "Ürəyin quruluş və işinin ultrasəslə qiymətləndirilməsi." },
      { name: "Holter 24 saatlıq monitorinq", desc: "Sutka ərzində ritmin fasiləsiz izlənməsi." },
      { name: "Tredmil stress test", desc: "Fiziki yüklənmə altında ürəyin reaksiyasının yoxlanması." },
    ],
    link: { href: "/kardioloji-check-up", label: "Kardioloji check-up paketi →" },
  },
  {
    id: "mualice",
    title: "Xəstəliklərin müalicəsi",
    photo: PHOTOS.consultation,
    photoAlt: "Dr. Kənan Əhmədov pasiyenti qəbul edərkən",
    lead: "Ürək-damar xəstəliklərinin geniş spektri üzrə sübuta əsaslanan, hər pasiyentə uyğun fərdi müalicə planı hazırlayırıq.",
    items: [
      { name: "Arterial hipertoniya", desc: "Yüksək təzyiqin idarə olunması və nəzarəti." },
      { name: "Aritmiya", desc: "Ritm pozğunluqlarının diaqnostikası və müalicəsi." },
      { name: "Ürək çatışmazlığı", desc: "Xroniki halların müasir terapiyası." },
      { name: "Ateroskleroz və xolesterin", desc: "Damar sağlamlığı və risklərin azaldılması." },
    ],
  },
  {
    id: "invaziv",
    title: "İnvaziv kardiologiya",
    photo: PHOTOS.angiography,
    photoAlt: "Dr. Kənan Əhmədov anqioqrafiya kabinetində — invaziv kardiologiya",
    lead: "Açıq əməliyyata ehtiyac olmadan, kateter əsaslı müasir müalicə metodları ilə mürəkkəb halların həlli.",
    items: [
      { name: "TAVİ", desc: "Aorta qapağının açıq əməliyyatsız dəyişdirilməsi." },
      { name: "EVAR və TEVAR", desc: "Aorta anevrizmalarının endovaskulyar müalicəsi." },
      { name: "Ritm cihazı implantasiyası", desc: "Bradikardiya hallarında süni ritm cihazı." },
      { name: "Stasionar və reanimasion təqib", desc: "Müalicə boyu peşəkar nəzarət." },
    ],
  },
  {
    id: "onlayn",
    title: "Onlayn konsultasiya",
    photo: PHOTOS.stethoscope,
    photoAlt: "Dr. Kənan Əhmədov — onlayn video konsultasiya",
    lead: "Məsafə maneə deyil. Video zəng vasitəsilə həkimlə birbaşa məsləhət, analizlərin dəyərləndirilməsi və ikinci rəy.",
    items: [
      { name: "Video konsultasiya", desc: "Həkimlə real vaxtda birbaşa görüş." },
      { name: "Analiz nəticələrinin təhlili", desc: "Mövcud müayinələrin peşəkar şərhi." },
      { name: "Müalicənin təkrar baxışı", desc: "Cari müalicənin qiymətləndirilməsi." },
      { name: "İkinci rəy", desc: "Diaqnoz və müalicə üçün müstəqil rəy." },
    ],
  },
];

const EXAMINATIONS = [
  { title: "Poliklinik Check UP", desc: "Şikayəti olmayan sağlam insanların ümumi sağlamlığının vaxtaşırı yoxlanması." },
  { title: "EKG", desc: "Elektrokardioqramma — ürəyin bioelektrik aktivliyinin müayinə üsulu." },
  { title: "EXOKG", desc: "Exo-kardioqrafiya — ürəyin ultrasəs diaqnostikası metodu." },
  { title: "Holter 24 saatlıq EKG", desc: "24 saat və daha uzun müddət ürək ritminin portativ qeydiyyatı." },
  { title: "Fiziki yük sınağı (Tredmil)", desc: "Fiziki yüklənmə zamanı EKQ ilə ürəyin qiymətləndirilməsi." },
  { title: "Stress exokardioqrafiya", desc: "Ritmi sürətləndirən dərmanlarla aparılan exokardioqrafiya." },
  { title: "Ürək Kompüter Tomoqrafiya", desc: "Ürək damarlarının görüntülənməsi üçün şüa diaqnostikası." },
  { title: "Ürək MRT (Kardiak MRT)", desc: "Ən müasir ürək diaqnostika metodlarından biri." },
];

const PROCEDURES = [
  { title: "Stasionar və kardioreanimasion təqib", desc: "Ürək xəstəliklərinin müalicəsində stasionar nəzarət." },
  { title: "İnvaziv kardiologiya", desc: "Müasir invaziv müayinə və müalicə metodları." },
  { title: "TAVİ", desc: "Aorta qapağının açıq əməliyyatsız metodla müalicəsi." },
  { title: "EVAR və TEVAR", desc: "Aorta anevrizmalarının açıq əməliyyatsız müalicəsi." },
  { title: "Ürək süni ritm cihazı implantasiyası", desc: "Bradikardiya hallarında ürəyin düzgün işini təmin edən prosedur." },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana səhifə", url: "/" },
          { name: "Xidmətlər", url: "/xidmetler" },
        ])}
      />

      {/* Intro */}
      <p className="eyebrow eyebrow-tick">Xidmətlər</p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Ürək sağlamlığınız üçün tam qayğı
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Diaqnostikadan müalicəyə, invaziv prosedurlardan onlayn konsultasiyaya qədər — ürək-damar
        sağlamlığının bütün mərhələlərində müasir yanaşma və fərdi diqqət. Aşağıda təqdim etdiyimiz
        əsas xidmət sahələri ilə tanış ola bilərsiniz.
      </p>
      <PulseMark className="mt-6 h-4 w-40 text-pulse" />

      {/* Video consultation highlight — the booking system is a video visit */}
      <ConsultationCallout className="mt-10" />

      {/* Main service areas */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {AREAS.map((area) => (
          <section key={area.id} id={area.id} className="card scroll-mt-24 overflow-hidden">
            {area.photo && (
              // 4:5 keeps a portrait source nearly intact; the old 16/9 showed
              // only the middle ~37% and decapitated every shot.
              <div className="relative aspect-[4/5] w-full sm:aspect-[3/2]">
                <Image
                  src={area.photo.src}
                  alt={area.photoAlt ?? area.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                  style={{ objectPosition: area.photo.focus }}
                />
              </div>
            )}
            <div className="p-8 sm:p-10">
            <PulseMark className="h-3 w-14 text-pulse/70" />
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{area.title}</h2>
            <p className="mt-3 leading-relaxed text-ink-soft">{area.lead}</p>
            <ul className="mt-6 space-y-4 border-t border-mist pt-6">
              {area.items.map((it) => (
                <li key={it.name} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  <span>
                    <span className="font-medium text-ink">{it.name}</span>
                    <span className="block text-sm text-ink-soft">{it.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
            {area.link && (
              <Link
                href={area.link.href}
                className="mt-6 inline-block text-sm font-medium text-teal hover:underline"
              >
                {area.link.label}
              </Link>
            )}
            </div>
          </section>
        ))}
      </div>

      {/* Examinations */}
      <section className="pt-24">
        <p className="eyebrow eyebrow-tick">Müayinələr</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Diaqnostika və müayinələr
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Ürəyin vəziyyətini dəqiq qiymətləndirmək üçün geniş çeşidli müayinələr.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXAMINATIONS.map((e) => (
            <div key={e.title} className="card flex flex-col gap-2.5 p-6">
              <PulseMark className="h-2 w-9 text-pulse/60" />
              <h3 className="font-display text-base font-semibold leading-snug text-ink">{e.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Procedures */}
      <section className="pt-24">
        <p className="eyebrow eyebrow-tick">Prosedurlar</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Bizim əsas prosedurlarımız
        </h2>
        <p className="mt-4 max-w-2xl text-ink-soft">
          Açıq əməliyyatsız, müasir invaziv metodlarla aparılan müalicələr.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROCEDURES.map((p) => (
            <div key={p.title} className="card flex flex-col gap-3 p-7">
              <PulseMark className="h-2.5 w-11 text-pulse/70" />
              <h3 className="font-display text-lg font-semibold leading-snug text-ink">{p.title}</h3>
              <p className="text-sm leading-relaxed text-ink-soft">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pt-24">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-12 shadow-soft-lg sm:px-12 sm:py-16">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-porcelain sm:text-3xl">
                Sizə uyğun xidməti seçək
              </h2>
              <p className="mt-2 max-w-md text-porcelain/70">
                Onlayn və ya kabinetdə konsultasiya üçün uyğun vaxtı seçin.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <BookingButton className="rounded-xl bg-pulse px-6 py-3 font-medium text-white transition-opacity hover:opacity-90" />
              <a href={CONTACT.phoneHref} className="rounded-xl border border-porcelain/25 px-6 py-3 font-medium text-porcelain transition-colors hover:bg-porcelain/10">
                Zəng et
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
