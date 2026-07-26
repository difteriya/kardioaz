import type { Metadata } from "next";
import Image from "next/image";
import { PulseMark } from "@/components/pulse-mark";
import { BookingButton } from "@/components/booking-button";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { PHOTOS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kardioloji check-up — ürək müayinəsi",
  description:
    "Kardioloji check-up: ürəyin kompleks müayinəsi (EKQ, exokardioqrafiya, təzyiq, lipid profili) və kardioloq şərhi. Ürək xəstəliklərini erkən aşkarlayın — Dr. Kənan Əhmədov.",
  alternates: { canonical: "/kardioloji-check-up" },
};

const INCLUDED = [
  { name: "Kardioloq konsultasiyası", desc: "Şikayət və risklərin dəyərləndirilməsi, fiziki müayinə." },
  { name: "EKQ (elektrokardioqrafiya)", desc: "Ürəyin elektrik aktivliyinin qeydə alınması." },
  { name: "Exokardioqrafiya (ürəyin USM-i)", desc: "Ürəyin quruluş və işinin ultrasəslə qiymətləndirilməsi." },
  { name: "Arterial təzyiqin ölçülməsi", desc: "Qan təzyiqinin dəqiq qeydə alınması." },
  { name: "Lipid profili / xolesterol", desc: "Damar riski üçün qanda yağların səviyyəsi." },
  { name: "Nəticələrin izahı", desc: "Kardioloqdan yekun rəy və fərdi tövsiyələr." },
];

const FOR_WHOM = [
  "40 yaşdan yuxarı olanlar",
  "Ailəsində ürək xəstəliyi olanlar",
  "Hipertoniya, yüksək xolesterol və ya diabet olanlar",
  "Siqaret çəkənlər, artıq çəkili və ya az hərəkətli olanlar",
  "Döş ağrısı, təngnəfəslik və ya çarpıntı şikayəti olanlar",
  "İdmanla ciddi məşğul olanlar",
];

const FAQ = [
  {
    question: "Kardioloji check-up nədir?",
    answer:
      "Kardioloji check-up ürək və damar sisteminin vəziyyətini qiymətləndirmək üçün aparılan kompleks müayinələr toplusudur. Məqsəd ürək xəstəliklərini erkən — hələ şikayət yaranmamış mərhələdə — aşkarlamaqdır.",
  },
  {
    question: "Kardioloji check-up-a nə daxildir?",
    answer:
      "Standart olaraq kardioloq konsultasiyası, EKQ, exokardioqrafiya, arterial təzyiqin ölçülməsi və lipid profili (xolesterol) daxildir. Zərurət olduqda Holter monitorinqi və ya stress test əlavə olunur; paket fərdi tənzimlənir.",
  },
  {
    question: "Şikayətim yoxdursa, check-up lazımdırmı?",
    answer:
      "Bəli. Əksər ürək xəstəlikləri erkən mərhələdə sakit, əlamətsiz gedir. Profilaktik yoxlama problemi vaxtında aşkarlayıб ciddi ağırlaşmaların qarşısını almağa imkan verir.",
  },
  {
    question: "Kimə kardioloji check-up tövsiyə olunur?",
    answer:
      "40 yaşdan yuxarı olanlara, ailə tarixçəsində ürək xəstəliyi olanlara, hipertoniya, yüksək xolesterol, diabet, artıq çəki və ya siqaret kimi risk faktorları olanlara, həmçinin döş ağrısı və təngnəfəslik şikayəti olanlara tövsiyə olunur.",
  },
  {
    question: "Nəticələri kim şərh edir?",
    answer:
      "Bütün müayinələrin nəticələri kardioloq Dr. Kənan Əhmədov tərəfindən dəyərləndirilir və sizə fərdi tövsiyələr verilir.",
  },
];

export default function CheckUpPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pt-14">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Ana səhifə", url: "/" },
            { name: "Xidmətlər", url: "/xidmetler" },
            { name: "Kardioloji check-up", url: "/kardioloji-check-up" },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <p className="eyebrow">Müayinə paketi</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Kardioloji check-up — ürək müayinəsi
      </h1>
      <PulseMark className="mt-5 h-5 w-52 text-pulse" />

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-mist bg-porcelain-2 shadow-soft">
        <Image
          src={PHOTOS.desk.src}
          alt="Kardioloji check-up — ürək müayinəsi və nəticələrin dəyərləndirilməsi"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
          style={{ objectPosition: PHOTOS.desk.focus }}
        />
      </div>

      <p className="mt-8 text-lg text-ink-soft">
        Kardioloji check-up — ürəyin və damar sisteminin bir müraciətdə hərtərəfli
        yoxlanmasıdır. Ürək xəstəlikləri çox vaxt uzun müddət əlamətsiz inkişaf edir;
        vaxtında keçirilən müayinə (urek muayinesi) problemi erkən aşkarlamağa və
        ciddi ağırlaşmaların qarşısını almağa imkan verir.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Check-up-a nə daxildir?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {INCLUDED.map((it) => (
            <div key={it.name} className="rounded-2xl border border-mist bg-porcelain-2/40 p-4">
              <p className="font-medium text-ink">{it.name}</p>
              <p className="mt-1 text-sm text-ink-soft">{it.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          Zərurət olduqda Holter 24 saatlıq monitorinqi və tredmil stress test paketə əlavə olunur.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Kimə tövsiyə olunur?</h2>
        <ul className="mt-5 space-y-3">
          {FOR_WHOM.map((f) => (
            <li key={f} className="flex items-start gap-3 text-ink-soft">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-2xl border border-mist bg-porcelain-2/50 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Ürəyinizi yoxladın</h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-soft">
          Kardioloji check-up üçün uyğun vaxt seçin. Onlayn konsultasiya ilə ilkin
          qiymətləndirmə də mümkündür.
        </p>
        <div className="mt-6 flex justify-center">
          <BookingButton className="rounded-xl bg-pulse px-6 py-3 font-medium text-white transition-opacity hover:opacity-90" />
        </div>
      </section>

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
