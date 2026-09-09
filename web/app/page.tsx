import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PulseMark } from "@/components/pulse-mark";
import { HomePostTabs } from "@/components/home-post-tabs";
import { VideoBackground } from "@/components/video-background";
import { BookingButton } from "@/components/booking-button";
import { ConsultationCallout } from "@/components/consultation-callout";
import { JsonLd } from "@/components/json-ld";
import { physicianSchema, organizationSchema, websiteSchema, faqSchema } from "@/lib/schema";
import { content } from "@/lib/content";
import { DOCTOR, SITE, CONTACT, PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  // Absolute title (no "— kardio.az" template) so the homepage leads with the
  // head keyword for the local pack — "Bakıda kardioloq" — then the entity
  // name, then the synonym people actually type ("ürək həkimi").
  title: { absolute: "Bakıda kardioloq — Dr. Kənan Əhmədov | ürək həkimi" },
  description:
    "Bakıda kardioloq Dr. Kənan Əhmədov (Kenan Ehmedov) — 15+ il təcrübəli ürək həkimi. Ürək-damar xəstəliklərinin diaqnostikası, müalicəsi, kardioloji check-up və onlayn video konsultasiya. Randevu: +994 10 382 29 99.",
  // Not a ranking factor for Google, but Yandex still reads it and Yandex is a
  // meaningful share of AZ search. Both spellings, per PROJECT-PLAN §5.
  keywords: [
    "kardioloq",
    "Bakıda kardioloq",
    "Bakida kardioloq",
    "yaxşı kardioloq",
    "yaxsi kardioloq",
    "ən yaxşı kardioloq",
    "en yaxsi kardioloq",
    "ürək həkimi",
    "urek hekimi",
    "Bakıda ürək həkimi",
    "Bakida urek hekimi",
    "kardioloq həkim",
    "onlayn kardioloq",
    "kardioloji check-up",
    "Kənan Əhmədov kardioloq",
    "Kenan Ehmedov kardioloq",
  ],
  alternates: { canonical: "/" },
};

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

/**
 * Homepage FAQ — the questions are written as they are actually typed into
 * Google ("Bakıda yaxşı kardioloq", "ürək həkimi hansı hallara baxır"), so the
 * block earns the FAQPage rich result and covers the long tail the head
 * keywords sit on. Answers stay honest: no invented prices, no "ən yaxşı"
 * self-award — the ranking claim is answered with criteria, not a boast.
 */
const FAQ = [
  {
    question: "Bakıda yaxşı kardioloq necə seçilir?",
    answer:
      "Yaxşı kardioloqu seçərkən üç şeyə baxın: ixtisas və təcrübə (neçə ildir kardiologiya ilə məşğuldur, invaziv prosedurlar aparırmı), müayinə imkanları (EKQ, exokardioqrafiya, Holter, stress test bir yerdə aparılırmı) və izahın aydınlığı — həkim nəticələri və müalicə planını sizə başa salmalıdır. Dr. Kənan Əhmədov 15 ildən artıqdır invaziv kardioloq kimi çalışır, 2003-cü ildə Azərbaycan Tibb Universitetini bitirib, Avstriya, Almaniya və Türkiyədə ixtisas kursları keçib.",
  },
  {
    question: "Ürək həkimi (kardioloq) hansı hallara baxır?",
    answer:
      "Kardioloq arterial hipertoniya (yüksək təzyiq), aritmiya və ürəkdöyünmə, ürək çatışmazlığı, ürək qapaqlarının xəstəlikləri, ateroskleroz, yüksək xolesterol və koronar ürək xəstəliyi ilə məşğul olur. Döş qəfəsində ağrı, təngnəfəslik, ürəyin tez-tez və ya nizamsız döyünməsi, ayaqlarda ödem, tez yorulma və huşitirmə — hamısı ürək həkiminə müraciət üçün əsasdır.",
  },
  {
    question: "Nə vaxt kardioloqa müraciət etmək lazımdır?",
    answer:
      "Şikayət yarananda gözləməyin: döş ağrısı, təngnəfəslik, çarpıntı və ya bayılma dərhal müraciət tələb edir. Şikayət olmasa belə, 40 yaşdan sonra, ailəsində erkən ürək xəstəliyi olanlar, hipertoniya, diabet, yüksək xolesterol, artıq çəki və siqaret kimi risk faktorları olanlar ildə bir dəfə kardioloji check-up keçirməlidir. Kəskin döş ağrısında isə əvvəlcə 103-ə zəng edin.",
  },
  {
    question: "Bakıda kardioloq qəbuluna necə yazılmaq olar?",
    answer:
      "Randevunu saytdan onlayn seçmək olar: uyğun vaxtı seçirsiniz, e-poçtunuzu təsdiqləyirsiniz və təyin olunmuş saatda qəbula gəlirsiniz. Telefonla yazılmaq üçün +994 10 382 29 99 nömrəsinə zəng edə bilərsiniz.",
  },
  {
    question: "Onlayn kardioloq konsultasiyası mümkündürmü?",
    answer:
      "Bəli. Video zəng vasitəsilə şikayətlərinizi müzakirə etmək, analiz və müayinə nəticələrini birlikdə nəzərdən keçirmək, təyin olunmuş müalicəyə ikinci rəy almaq mümkündür. Onlayn konsultasiya regionlardan və xaricdən müraciət edənlər üçün, həmçinin təkrar baxışlar üçün əlverişlidir. Fiziki müayinə tələb edən hallarda həkim sizi kabinet qəbuluna dəvət edir.",
  },
  {
    question: "İlk kardioloq qəbuluna nə gətirmək lazımdır?",
    answer:
      "Əvvəlki EKQ, exokardioqrafiya və Holter nəticələrini, son qan analizlərini (xolesterol, qan şəkəri), hazırda qəbul etdiyiniz dərmanların siyahısını və varsa təzyiq ölçmə qeydlərinizi götürün. Bu sənədlər diaqnozu dəqiqləşdirir və təkrar müayinələrə ehtiyacı azaldır.",
  },
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
  const postTabDefs = [
    { slug: "blog", name: "Bloq" },
    { slug: "xestelikler", name: "Xəstəliklər" },
    { slug: "hekimler-ucun", name: "Həkimlər üçün" },
  ];
  const postTabs = (
    await Promise.all(
      postTabDefs.map(async (c) => ({
        ...c,
        posts: (await content.getPostsByCategory(c.slug).catch(() => [])).slice(0, 3),
      })),
    )
  ).filter((c) => c.posts.length > 0);

  return (
    <>
      <JsonLd data={[physicianSchema(), organizationSchema(), websiteSchema(), faqSchema(FAQ)]} />

      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-[calc(100svh-73px)] flex-col overflow-hidden">
        <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="ecg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid w-full max-w-6xl flex-1 content-center gap-10 px-5 pt-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center">
            {/* The eyebrow lives inside the h1 so the head keyword ("Bakıda
                kardioloq") is part of the heading Google reads, while the
                rendered design is unchanged. */}
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              <span className="eyebrow eyebrow-tick block font-normal tracking-[0.13em]">
                Bakıda kardioloq · ürək həkimi
              </span>
              <span className="mt-4 block">
                Sizin ürək
                <br />
                həkiminiz
              </span>
            </h1>
            <PulseMark loop className="mt-5 h-6 w-64 text-pulse" strokeWidth={2.5} />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              {DOCTOR.name} — Bakıda invaziv kardioloq. Ürək-damar xəstəliklərinin
              diaqnostikası, müalicəsi və onlayn video konsultasiya. Ürəyinizin
              sağlamlığı etibarlı əllərdə.
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

      {/* ---------------- SEO copy: "Bakıda kardioloq" ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <p className="eyebrow eyebrow-tick">Bakıda kardioloq</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Ürək həkimi axtarırsınız?
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-ink-soft">
              <p>
                Bakıda kardioloq seçmək asan deyil — axtarış nəticələrində onlarla ad
                çıxır, amma ürək məsələsində vacib olan üç şeydir: təcrübə, düzgün
                müayinə və nəticələrin sizə aydın izah edilməsi. {DOCTOR.name} 15
                ildən artıqdır ürək-damar xəstəlikləri üzrə çalışır və invaziv
                kardioloq kimi həm diaqnostika, həm də müalicə mərhələsini özü aparır.
              </p>
              <p>
                Qəbulda şikayətləriniz və risk faktorlarınız dəyərləndirilir, zərurət
                olduqda EKQ, exokardioqrafiya, Holter monitorinqi və ya tredmil stress
                test təyin olunur. Nəticələr bir yerdə şərh edilir və sizə anlaşılan
                dildə fərdi müalicə planı verilir — nə üçün hansı dərmanı qəbul
                etdiyinizi bilərək gedirsiniz.
              </p>
              <p>
                Bakıdan kənarda yaşayırsınızsa və ya təkrar baxışa ehtiyacınız varsa,
                onlayn video konsultasiya seçimi var: analizlərinizi birlikdə nəzərdən
                keçirir, təyin olunmuş müalicəyə ikinci rəy alırsınız.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BookingButton className="rounded-xl bg-teal px-6 py-3 font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg" />
              <a
                href={CONTACT.phoneHref}
                className="rounded-xl border border-mist bg-porcelain/70 px-6 py-3 font-medium text-ink transition-colors hover:border-teal hover:text-teal"
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>

          <div className="card p-8">
            <h3 className="font-display text-lg font-semibold text-ink">Qısa məlumat</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="eyebrow text-ink-soft">Həkim</dt>
                <dd className="mt-1 text-ink">
                  {DOCTOR.name} — {DOCTOR.title}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">İxtisas</dt>
                <dd className="mt-1 text-ink">Kardiologiya, ürək-damar xəstəlikləri</dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">Yer</dt>
                <dd className="mt-1 text-ink">{CONTACT.address} · onlayn video konsultasiya</dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">İş saatları</dt>
                <dd className="mt-1 text-ink">B.e — Cümə 09:00—18:00 · Şənbə 10:00—14:00</dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-soft">Randevu</dt>
                <dd className="mt-1 text-ink">
                  <a href={CONTACT.phoneHref} className="text-teal hover:text-teal-deep">
                    {CONTACT.phone}
                  </a>{" "}
                  və ya{" "}
                  <Link href={SITE.bookingUrl} className="text-teal hover:text-teal-deep">
                    onlayn
                  </Link>
                </dd>
              </div>
            </dl>
            <p className="mt-6 border-t border-mist pt-5 text-xs leading-relaxed text-ink-soft">
              Təcili hallarda — kəskin döş ağrısı, güclü təngnəfəslik, huşitirmə —
              gözləmədən <strong className="text-ink">103</strong> nömrəsinə zəng edin.
            </p>
          </div>
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

      {/* ---------------- Latest posts (tabbed by category) ---------------- */}
      {postTabs.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pt-24">
          <SectionHead eyebrow="Bloq" title="Son yazılar" cta={{ label: "Bütün yazılar", href: "/blog" }} />
          <HomePostTabs categories={postTabs} />
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

      {/* ---------------- FAQ ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <SectionHead eyebrow="Suallar" title="Kardioloq haqqında tez-tez verilən suallar" />
        <dl className="mt-10 grid gap-4 lg:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.question} className="card p-7">
              <dt className="font-display text-lg font-semibold leading-snug text-ink">{f.question}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-soft">{f.answer}</dd>
            </div>
          ))}
        </dl>
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
