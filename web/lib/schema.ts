/**
 * JSON-LD schema builders (PROJECT-PLAN.md §5).
 * MedicalWebPage / Physician / MedicalOrganization / BreadcrumbList / FAQPage.
 * Physician.alternateName carries the ASCII-folded doctor name for AZ SEO.
 */
import { SITE, DOCTOR, CONTACT, PHOTOS } from "@/lib/site";
import type { Post, FaqItem } from "@/lib/content";

/**
 * Local-pack targeting: `Physician` is a LocalBusiness subtype, so areaServed,
 * opening hours and availableService are what Google reads for "Bakıda
 * kardioloq" style queries. alternateName carries the ASCII-folded name plus
 * the bare Azerbaijani forms of the head keywords (PROJECT-PLAN §5) — Google
 * treats them as other names the entity is known by, which is exactly how
 * `kenan ehmedov kardioloq` is typed in practice.
 */
const SERVED_CONDITIONS = [
  "Arterial hipertoniya",
  "Aritmiya",
  "Ürək çatışmazlığı",
  "Ateroskleroz",
  "Ürək qapaqlarının xəstəlikləri",
  "Koronar ürək xəstəliyi",
  "Yüksək xolesterol",
];

const SERVED_PROCEDURES = [
  "Kardioloq konsultasiyası",
  "Onlayn video konsultasiya",
  "Kardioloji check-up",
  "EKQ (elektrokardioqrafiya)",
  "Exokardioqrafiya",
  "Holter 24 saatlıq monitorinq",
  "Tredmil stress test",
  "İnvaziv kardiologiya",
];

export function physicianSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${SITE.url}/#physician`,
    name: DOCTOR.name,
    alternateName: [
      DOCTOR.nameAscii,
      "Kənan Əhmədov kardioloq",
      "Kenan Ehmedov kardioloq",
      "Bakıda kardioloq",
      "Bakida kardioloq",
      "Ürək həkimi",
      "Urek hekimi",
    ],
    jobTitle: DOCTOR.title,
    medicalSpecialty: "Cardiovascular",
    url: SITE.url,
    // A real photo of the physician is an E-E-A-T signal on a medical YMYL
    // site, and Google can surface it in the knowledge panel.
    image: `${SITE.url}${PHOTOS.hero.src}`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bakı",
      addressRegion: "Bakı",
      addressCountry: "AZ",
    },
    areaServed: [
      { "@type": "City", name: "Bakı" },
      { "@type": "Country", name: "Azərbaycan" },
    ],
    availableLanguage: ["az", "tr", "ru", "en"],
    knowsAbout: SERVED_CONDITIONS,
    availableService: SERVED_PROCEDURES.map((name) => ({
      "@type": "MedicalProcedure",
      name,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "14:00",
      },
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Azərbaycan Tibb Universiteti",
    },
    description: DOCTOR.bioShort,
  };
}

/** Brand entity for the site itself — helps Google resolve `kardio.az`. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    alternateName: ["kardio.az", "Kardio.az kardioloq", "Sizin ürək həkiminiz"],
    url: SITE.url,
    inLanguage: "az",
    publisher: { "@id": `${SITE.url}/#physician` },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: "Kardio.az — kardioloq Dr. Kənan Əhmədov",
    url: SITE.url,
    logo: `${SITE.url}${PHOTOS.hero.src}`,
    image: `${SITE.url}${PHOTOS.hero.src}`,
    slogan: SITE.tagline,
    medicalSpecialty: "Cardiovascular",
    telephone: CONTACT.phone,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bakı",
      addressRegion: "Bakı",
      addressCountry: "AZ",
    },
    areaServed: [
      { "@type": "City", name: "Bakı" },
      { "@type": "Country", name: "Azərbaycan" },
    ],
    employee: { "@id": `${SITE.url}/#physician` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.url}`,
    })),
  };
}

export function faqSchema(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function articleSchema(post: Post, categoryPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.seo.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "az",
    author: { "@type": "Physician", name: DOCTOR.name, alternateName: DOCTOR.nameAscii },
    publisher: { "@type": "MedicalOrganization", name: SITE.name },
    mainEntityOfPage: `${SITE.url}/${categoryPath}/${post.slug}`,
  };
}
