import Link from "next/link";
import Image from "next/image";
import { PulseMark } from "@/components/pulse-mark";
import { PostCard } from "@/components/post-card";
import { VideoBackground } from "@/components/video-background";
import { BookingButton } from "@/components/booking-button";
import { ConsultationCallout } from "@/components/consultation-callout";
import { JsonLd } from "@/components/json-ld";
import { physicianSchema, organizationSchema } from "@/lib/schema";
import { content } from "@/lib/content";
import { DOCTOR, SITE, CONTACT, PHOTOS } from "@/lib/site";

const SERVICES = [
  {
    title: "Ürək diaqnostikası",
    desc: "Ürək-damar sisteminin dəqiq və hərtərəfli qiymətləndirilməsi üçün müasir müayinələr.",
    items: ["EKQ və exokardioqrafiya", "Holter 24 saatlıq monitorinq", "Tredmil stress test", "Ürək KT və MRT"],
    href: "/xidmetler#diaqnostika",
  },
  {
    title: "Xəstəliklərin müalicəsi",
    desc: "Ürək-damar xəstəliklərinin geniş spektri üzrə fərdi müalicə planı.",
    items: ["Arterial hipertoniya", "Aritmiya (ritm pozğunluğu)", "Ürək çatışmazlığı", "Ateroskleroz və xolesterin"],
    href: "/xidmetler#mualice",
  },
  {
    title: "İnvaziv kardiologiya",
    desc: "Açıq əməliyyatsız, müasir invaziv müayinə və müalicə metodları.",
    items: ["TAVİ — aorta qapağı", "EVAR və TEVAR", "Ritm cihazı implantasiyası", "Stasionar təqib"],
    href: "/xidmetler#mualice",
  },
  {
    title: "Onlayn konsultasiya",
    desc: "Video zəng vasitəsilə həkimlə birbaşa məsləhət — evdən çıxmadan.",
    items: ["Video konsultasiya", "Analiz nəticələrinin təhlili", "Müalicənin təkrar baxışı", "İkinci rəy"],
    href: SITE.bookingUrl,
  },
];

const STATS = [
  { value: "15+", label: "il təcrübə" },
  { value: "2003", label: "AMU məzunu" },
  { value: "4", label: "ölkədə ixtisas" },
];

const CREDENTIALS = ["İnvaziv Kardioloq", "Almaniyada iş təcrübəsi", "Vyana · Frankfurt təlimləri", "Kardiovaskulyar mütəxəssis"];

const CONDITIONS = [
  "Arterial hipertoniya",
  "Aritmiya (ritm pozğunluğu)",
  "Ürək çatışmazlığı",
  "Ürək qapaqlarının xəstəlikləri",
  "Ateroskleroz",
  "Ürəkdöyünmə və taxikardiya",
];

const STEPS = [
  { n: "01", title: "Uyğun vaxtı seçin", desc: "Boş vaxtlardan birini seçin və e-poçtunuzu daxil edin." },
  { n: "02", title: "E-poçtu təsdiqləyin", desc: "Göndərilən keçidlə randevunu 15 dəqiqə ərzində təsdiqləyin." },
  { n: "03", title: "Video ilə görüşün", desc: "Təyin olunan vaxtda həkimlə birbaşa video konsultasiya." },
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

function SectionHead({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: { label: string; href: string } }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow eyebrow-tick">{eyebrow}</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      {cta && (
        <Link href={cta.href} className="hidden shrink-0 text-sm font-medium text-teal hover:text-teal-deep sm:block">
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const latestPosts = (await content.getAllPosts().catch(() => [])).slice(0, 3);

  return (
    <>
      <JsonLd data={[physicianSchema(), organizationSchema()]} />

      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[calc(100svh-73px)] flex-col overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="ecg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl flex-1 content-center gap-10 px-5 pt-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center">
            <p className="eyebrow eyebrow-tick">Kardioloq · Bakı</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Sizin ürək
              <br />
              həkiminiz
            </h1>
            <PulseMark loop className="mt-5 h-6 w-64 text-pulse" strokeWidth={2.5} />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              {DOCTOR.name} — ürək-damar xəstəliklərinin diaqnostikası, müalicəsi
              və onlayn konsultasiyası. Ürəyinizin sağlamlığı etibarlı əllərdə.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BookingButton className="rounded-xl bg-teal px-6 py-3 font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg" />
              <Link href="/xidmetler" className="rounded-xl border border-mist bg-porcelain/70 px-6 py-3 font-medium text-ink transition-colors hover:border-teal hover:text-teal">
                Xidmətlər
              </Link>
              <span className="text-sm text-ink-soft">onlayn video zəng ilə</span>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {CREDENTIALS.map((c) => (
                <li key={c} className="rounded-full border border-mist bg-porcelain/70 px-3 py-1 text-xs text-ink-soft shadow-soft">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-end justify-center">
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-mist bg-gradient-to-b from-porcelain-2 to-mist-soft shadow-soft-lg">
              {/* object-cover, not contain: these are real photographs with a
                  background, not the cut-out PNGs the frame was built for.
                  focus keeps the face in frame — see PHOTOS in lib/site.ts. */}
              <Image
                src={PHOTOS.hero.src}
                alt={`${DOCTOR.name} — ${DOCTOR.title}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
                style={{ objectPosition: PHOTOS.hero.focus }}
              />
              <span className="absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-teal/70" />
              <span className="absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-teal/70" />
              <span className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-teal/70" />
              <span className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-teal/70" />
            </div>
          </div>
        </div>

        {/* stat cards */}
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-6">
          <dl className="grid grid-cols-3 gap-3 sm:gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="card px-4 py-5 text-center">
                <dt className="font-display text-3xl font-semibold text-ink sm:text-4xl">{s.value}</dt>
                <dd className="eyebrow mt-2 text-ink-soft">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <SectionHead eyebrow="Xidmətlər" title="Ürək sağlamlığınız üçün tam qayğı" cta={{ label: "Hamısına bax", href: "/xidmetler" }} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {SERVICES.map((svc) => (
            <Link
              key={svc.title}
              href={svc.href}
              className="card card-hover group flex flex-col gap-6 p-8 sm:p-10"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <PulseMark className="h-3 w-14 text-pulse/60 transition-colors group-hover:text-pulse" />
                  <h3 className="mt-4 font-display text-2xl font-semibold text-ink">{svc.title}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-ink-soft">{svc.desc}</p>
                </div>
                <span className="mt-1 shrink-0 text-teal transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
              <ul className="grid gap-2.5 border-t border-mist pt-6 sm:grid-cols-2">
                {svc.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-sm text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {it}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Video consultation callout ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <ConsultationCallout />
      </section>

      {/* ---------------- Müayinələr ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <SectionHead eyebrow="Müayinələr" title="Diaqnostika və müayinələr" />
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

      {/* ---------------- Video band ---------------- */}
      <VideoBackground />

      {/* ---------------- Prosedurlar ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <SectionHead eyebrow="Prosedurlar" title="Bizim əsas prosedurlarımız" />
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

      {/* ---------------- Conditions ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow eyebrow-tick">Müalicə sahələri</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Hansı halların müalicəsi ilə məşğul oluruq
            </h2>
            <p className="mt-4 text-ink-soft">
              Ürək-damar xəstəliklərinin geniş spektri üzrə diaqnostika və fərdi müalicə.
            </p>
            <Link href="/xestelikler" className="mt-6 inline-block text-sm font-medium text-teal hover:text-teal-deep">
              Xəstəliklər haqqında oxu →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {CONDITIONS.map((c) => (
              <li key={c} className="card flex items-center gap-3 px-5 py-4 text-ink">
                <PulseMark className="h-2 w-7 shrink-0 text-pulse/70" />
                <span className="text-sm font-medium">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="overflow-hidden rounded-3xl border border-mist bg-gradient-to-br from-porcelain-2 to-porcelain p-8 shadow-soft-lg sm:p-12">
          <p className="eyebrow eyebrow-tick">Onlayn konsultasiya</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Necə işləyir</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="font-mono text-sm text-teal">{s.n}</span>
                <PulseMark className="mt-2 h-2 w-10 text-pulse/60" />
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </li>
            ))}
          </ol>
          <BookingButton className="mt-10 rounded-xl bg-teal px-6 py-3 font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg" />
        </div>
      </section>

      {/* ---------------- Latest posts ---------------- */}
      {latestPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-24">
          <SectionHead eyebrow="Bloq" title="Son yazılar" cta={{ label: "Bütün yazılar", href: "/blog" }} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <PostCard key={post.slug} post={post} categorySlug={post.categorySlug} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- About ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="grid gap-10 overflow-hidden rounded-3xl border border-mist bg-gradient-to-br from-porcelain-2 to-porcelain p-8 shadow-soft-lg sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-mist bg-gradient-to-b from-porcelain to-mist-soft shadow-soft">
            <Image
              src={PHOTOS.portrait.src}
              alt={`${DOCTOR.name} — ${DOCTOR.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 320px"
              className="object-cover"
              style={{ objectPosition: PHOTOS.portrait.focus }}
            />
          </div>
          <div>
            <p className="eyebrow eyebrow-tick">Haqqımda</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{DOCTOR.name}</h2>
            <p className="mt-2 text-sm text-teal">{DOCTOR.credentials}</p>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{DOCTOR.bioShort}</p>
            <Link href="/haqqimda" className="mt-6 inline-block text-sm font-medium text-teal hover:text-teal-deep">
              Ətraflı tanış ol →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-14 text-center shadow-soft-lg sm:px-12 sm:py-20">
          <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />
          <div className="relative">
            <PulseMark className="mx-auto h-6 w-72 text-pulse/60" />
            <h2 className="mx-auto mt-6 max-w-xl font-display text-3xl font-semibold tracking-tight text-porcelain sm:text-4xl">
              Ürəyiniz üçün ilk addımı bu gün atın
            </h2>
            <p className="mx-auto mt-4 max-w-md text-porcelain/70">
              Onlayn və ya kabinetdə konsultasiya üçün uyğun vaxtı seçin.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <BookingButton className="rounded-xl bg-pulse px-6 py-3 font-medium text-white transition-opacity hover:opacity-90" />
              <a href={CONTACT.phoneHref} className="rounded-xl border border-porcelain/25 px-6 py-3 font-medium text-porcelain transition-colors hover:bg-porcelain/10">
                Zəng et
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
