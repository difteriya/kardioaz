import type { Category, Post, ContentSource } from "./types";
import { DOCTOR } from "@/lib/site";
import { detectPostLanguage } from "@/lib/lang";

/**
 * Mock content — sample Azerbaijani cardiology posts across the three existing
 * WP categories. Keywords are seeded in BOTH proper and ASCII-folded forms for
 * SEO coverage (PROJECT-PLAN.md §5). Swap this provider for WPGraphQL later.
 */

const CATEGORIES: Category[] = [
  {
    slug: "blog",
    name: "Bloq",
    description:
      "Ürək sağlamlığı, profilaktika və pasiyentlər üçün faydalı məsləhətlər.",
  },
  {
    slug: "hekimler-ucun",
    name: "Həkimlər üçün",
    description: "Kardiologiya üzrə klinik materiallar və peşəkar məzmun.",
  },
  {
    slug: "xestelikler",
    name: "Xəstəliklər",
    description:
      "Ürək-damar xəstəlikləri: əlamətlər, diaqnostika və müalicə üsulları.",
  },
];

function p(...paras: string[]): string {
  return paras.map((t) => `<p>${t}</p>`).join("\n");
}

const RAW_POSTS: Omit<Post, "language">[] = [
  {
    slug: "yuksek-tezyiq-hipertoniya",
    title: "Yüksək təzyiq (hipertoniya) nədir və necə idarə olunur?",
    excerpt:
      "Arterial hipertoniya — ürək-damar xəstəliklərinin ən geniş yayılmış səbəbidir. Əlamətləri, riskləri və idarəetmə yolları.",
    contentHtml: p(
      "Arterial <strong>hipertoniya</strong> (yüksək qan təzyiqi) dünyada ən geniş yayılmış ürək-damar problemlərindən biridir. Çox vaxt heç bir əlamət vermədən illərlə davam edə bilər.",
      "Normal qan təzyiqi 120/80 mm c.s. ətrafında olur. 140/90-dan yüksək göstəricilər hipertoniya kimi qiymətləndirilir və həkim nəzarəti tələb edir.",
      "<h2>Əsas risk faktorları</h2>",
      "Artıq çəki, duzun həddindən artıq istifadəsi, hərəkətsiz həyat tərzi, siqaret və stress təzyiqin yüksəlməsinə səbəb olur.",
      "<h2>İdarəetmə</h2>",
      "Müalicə həyat tərzinin dəyişdirilməsi və zərurət olduqda dərman terapiyasından ibarətdir. Təzyiqi müntəzəm ölçmək və həkimlə əlaqə saxlamaq vacibdir.",
    ),
    categorySlug: "blog",
    publishedAt: "2026-03-12",
    updatedAt: "2026-06-01",
    author: DOCTOR.name,
    readingMinutes: 5,
    seo: {
      metaDescription:
        "Hipertoniya (yüksək təzyiq) nədir? Yuksek tezyiq əlamətləri, riskləri və idarəetmə yolları — kardioloq məsləhəti.",
      keywords: [
        "hipertoniya",
        "yüksək təzyiq",
        "yuksek tezyiq",
        "qan təzyiqi",
        "qan tezyiqi",
        "arterial hipertoniya",
      ],
    },
    faq: [
      {
        question: "Hipertoniya sağalırmı?",
        answer:
          "Hipertoniya çox vaxt tam sağalmır, lakin düzgün müalicə və həyat tərzi ilə tam nəzarətdə saxlanıla bilər.",
      },
      {
        question: "Təzyiqi gündə neçə dəfə ölçmək lazımdır?",
        answer:
          "Adətən səhər və axşam, sakit vəziyyətdə ölçmək tövsiyə olunur. Dəqiq rejim üçün həkiminizlə məsləhətləşin.",
      },
    ],
  },
  {
    slug: "urek-agrisi-ne-zaman-hekime",
    title: "Ürək ağrısı: nə zaman təcili həkimə müraciət etməli?",
    excerpt:
      "Döş qəfəsindəki hər ağrı ürəklə bağlı olmasa da, bəzi əlamətlər təcili yardım tələb edir. Nəyə diqqət etməli?",
    contentHtml: p(
      "<strong>Ürək ağrısı</strong> (urek agrisi) həmişə ürəklə bağlı olmur, lakin bəzi hallar təcili tibbi müdaxilə tələb edir.",
      "<h2>Təcili əlamətlər</h2>",
      "Döş qəfəsində sıxıcı ağrı, sol qola və ya çənəyə yayılan ağrı, nəfəs darlığı, soyuq tər — bu əlamətlər zamanı dərhal <strong>103</strong>-ə zəng edin.",
      "<h2>Planlı müraciət</h2>",
      "Təkrarlanan, fiziki yüklənmə zamanı yaranan ağrılar üçün kardioloqa müraciət edərək EKQ və exokardioqrafiya keçirmək lazımdır.",
    ),
    categorySlug: "blog",
    publishedAt: "2026-04-05",
    author: DOCTOR.name,
    readingMinutes: 4,
    seo: {
      metaDescription:
        "Ürək ağrısı (urek agrisi) nə zaman təhlükəlidir? Təcili əlamətlər və həkimə müraciət qaydası.",
      keywords: ["ürək ağrısı", "urek agrisi", "döş ağrısı", "infarkt əlamətləri"],
    },
  },
  {
    slug: "aritmiya-urek-ritmi",
    title: "Aritmiya — ürək ritminin pozulması",
    excerpt:
      "Ürəyin çox tez, çox yavaş və ya nizamsız döyünməsi. Aritmiyanın növləri, əlamətləri və müalicəsi.",
    contentHtml: p(
      "<strong>Aritmiya</strong> ürək ritminin pozulmasıdır — ürək çox tez (taxikardiya), çox yavaş (bradikardiya) və ya nizamsız döyünə bilər.",
      "<h2>Əlamətlər</h2>",
      "Ürəkdöyünmənin hiss olunması, başgicəllənmə, zəiflik, bəzən huşun itməsi. Bəzi aritmiyalar isə heç bir əlamət vermir.",
      "<h2>Diaqnostika və müalicə</h2>",
      "EKQ və Holter monitorinqi əsas diaqnostika üsullarıdır. Müalicə növündən asılı olaraq dərman, kateter ablasyonu və ya kardiostimulyator ola bilər.",
    ),
    categorySlug: "xestelikler",
    publishedAt: "2026-02-20",
    author: DOCTOR.name,
    readingMinutes: 6,
    seo: {
      metaDescription:
        "Aritmiya nədir? Ürək ritminin pozulması (urek ritmi) — əlamətlər, diaqnostika və müalicə üsulları.",
      keywords: ["aritmiya", "ürək ritmi", "urek ritmi", "taxikardiya", "ürəkdöyünmə"],
    },
  },
  {
    slug: "urek-catismazligi",
    title: "Ürək çatışmazlığı: əlamətlər və müalicə",
    excerpt:
      "Ürəyin qanı kifayət qədər vurmaması ilə xarakterizə olunan xroniki hal. Erkən aşkarlama həyat keyfiyyətini artırır.",
    contentHtml: p(
      "<strong>Ürək çatışmazlığı</strong> (urek catismazligi) ürəyin orqanizmin ehtiyacı qədər qan vura bilməməsidir.",
      "<h2>Əlamətlər</h2>",
      "Nəfəs darlığı, ayaqlarda şişkinlik, sürətli yorulma və gecə öskürəyi tez-tez rast gəlinən əlamətlərdir.",
      "<h2>Müalicə</h2>",
      "Müasir müalicə dərman terapiyası, həyat tərzinin dəyişdirilməsi və müntəzəm həkim nəzarətini əhatə edir. Erkən müraciət proqnozu əhəmiyyətli dərəcədə yaxşılaşdırır.",
    ),
    categorySlug: "xestelikler",
    publishedAt: "2026-01-15",
    updatedAt: "2026-05-10",
    author: DOCTOR.name,
    readingMinutes: 6,
    seo: {
      metaDescription:
        "Ürək çatışmazlığı (urek catismazligi) əlamətləri və müalicəsi — kardioloq Dr. Kənan Əhmədov.",
      keywords: [
        "ürək çatışmazlığı",
        "urek catismazligi",
        "nəfəs darlığı",
        "ürək zəifliyi",
      ],
    },
  },
  {
    slug: "xolesterin-urek-saglamligi",
    title: "Xolesterin və ürək sağlamlığı",
    excerpt:
      "Yüksək xolesterin damarların daralmasına və infarkt riskinə səbəb olur. Səviyyəni necə nəzarətdə saxlamalı?",
    contentHtml: p(
      "<strong>Xolesterin</strong> orqanizm üçün lazımlı maddədir, lakin yüksək səviyyəsi damarlarda lövhələrin yaranmasına gətirib çıxarır.",
      "<h2>LDL və HDL</h2>",
      "LDL (“pis” xolesterin) yüksək olduqda ürək-damar riski artır; HDL (“yaxşı” xolesterin) isə qoruyucu rol oynayır.",
      "<h2>Nəzarət</h2>",
      "Sağlam qidalanma, fiziki aktivlik və zərurət olduqda statin terapiyası xolesterin səviyyəsini idarə etməyə kömək edir.",
    ),
    categorySlug: "blog",
    publishedAt: "2026-05-22",
    author: DOCTOR.name,
    readingMinutes: 5,
    seo: {
      metaDescription:
        "Xolesterin nədir və ürək sağlamlığına təsiri. Yüksək xolesterini necə nəzarətdə saxlamalı?",
      keywords: ["xolesterin", "yüksək xolesterin", "yuksek xolesterin", "LDL", "statin"],
    },
  },
  {
    slug: "ekq-tefsiri-praktik-yanasma",
    title: "EKQ təfsiri: praktik yanaşma",
    excerpt:
      "Birinci pillə həkimləri üçün elektrokardioqrammanın sistemli oxunması üzrə qısa praktik bələdçi.",
    contentHtml: p(
      "Bu material həkimlər üçün nəzərdə tutulub. <strong>EKQ</strong> təfsirində sistemli yanaşma diaqnostik səhvləri azaldır.",
      "<h2>Sistemli oxu ardıcıllığı</h2>",
      "Ritm, tezlik, ox, intervallar (PR, QRS, QT) və seqmentlərin qiymətləndirilməsi ardıcıl aparılmalıdır.",
      "<h2>Diqqət tələb edən hallar</h2>",
      "ST elevasiyası, patoloji Q dişləri və ritm pozğunluqları təcili qiymətləndirmə tələb edir.",
    ),
    categorySlug: "hekimler-ucun",
    publishedAt: "2026-06-18",
    author: DOCTOR.name,
    readingMinutes: 8,
    seo: {
      metaDescription:
        "EKQ təfsiri üçün praktik, sistemli yanaşma — həkimlər üçün klinik bələdçi.",
      keywords: ["EKQ", "elektrokardioqramma", "ekq tefsiri", "ritm pozğunluğu"],
    },
  },
];

const POSTS: Post[] = RAW_POSTS.map((p) => ({
  ...p,
  language: detectPostLanguage(`${p.title} ${p.excerpt}`),
}));

export const mockContent: ContentSource = {
  async getCategories() {
    return CATEGORIES;
  },
  async getCategory(slug) {
    return CATEGORIES.find((c) => c.slug === slug) ?? null;
  },
  async getAllPosts() {
    return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getPostsByCategory(categorySlug) {
    return POSTS.filter((post) => post.categorySlug === categorySlug).sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  },
  async getPost(slug) {
    return POSTS.find((post) => post.slug === slug) ?? null;
  },
};
