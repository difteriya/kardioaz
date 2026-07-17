/**
 * JSON-LD schema builders (PROJECT-PLAN.md §5).
 * MedicalWebPage / Physician / MedicalOrganization / BreadcrumbList / FAQPage.
 * Physician.alternateName carries the ASCII-folded doctor name for AZ SEO.
 */
import { SITE, DOCTOR, CONTACT, PHOTOS } from "@/lib/site";
import type { Post, FaqItem } from "@/lib/content";

export function physicianSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: DOCTOR.name,
    alternateName: DOCTOR.nameAscii,
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
      addressCountry: "AZ",
    },
    description: DOCTOR.bioShort,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: SITE.name,
    url: SITE.url,
    slogan: SITE.tagline,
    medicalSpecialty: "Cardiovascular",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bakı",
      addressCountry: "AZ",
    },
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
