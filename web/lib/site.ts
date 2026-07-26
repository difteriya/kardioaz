/**
 * Central site configuration for kardio.az.
 * Azerbaijani-only site. Keep proper spelling in visible copy; ASCII-folded
 * variants are seeded via `asciiFold()` for SEO (see PROJECT-PLAN.md §5).
 */

export const SITE = {
  name: "kardio.az",
  url: "https://kardio.az",
  tagline: "Sizin ürək həkiminiz",
  description:
    "Kardioloq Dr. Kənan Əhmədov — ürək-damar xəstəliklərinin diaqnostikası, " +
    "müalicəsi və onlayn konsultasiya. Ürəyinizin sağlamlığı etibarlı əllərdə.",
  locale: "az",
  bookingUrl: "/randevu",
} as const;

export const DOCTOR = {
  name: "Dr. Kənan Əhmədov",
  /** ASCII-folded variant, used naturally for search coverage. */
  nameAscii: "Dr. Kenan Ehmedov",
  firstName: "Kənan",
  lastName: "Əhmədov",
  title: "İnvaziv Kardioloq",
  credentials: "İnvaziv Kardioloq · Kardiovaskulyar xəstəliklər üzrə mütəxəssis",
  bioShort:
    "Artıq 15 ilə yaxındır ki, kardiovaskulyar xəstəliklər üzrə mütəxəssis və invaziv " +
    "kardioloq kimi çalışır. 2003-cü ildə Azərbaycan Tibb Universitetini bitirib; " +
    "Azərbaycan, Avstriya, Türkiyə və Almaniyada ixtisas kurslarını tamamlayıb.",
  /**
   * Owner-supplied photography (Google Drive, 2026-07-17).
   * Every image here shows the doctor, the team or equipment only — see PHOTOS
   * below for why that matters.
   */
  photoHero: "/images/dr-kenan-hero.jpg",
  photoPortrait: "/images/dr-kenan-portrait.jpg",
} as const;

/**
 * Shared photo library — owner's professional shoot.
 *
 * ⚠️ Patient privacy: the source folders also contain photos of identifiable
 * patients (faces visible during consultations and procedures). None of those
 * are used here. Publishing a recognisable patient needs that patient's written
 * consent, which we do not have on file — so this set is restricted to the
 * doctor, the team and equipment. See PROJECT-PLAN §15.
 */
/**
 * `focus` is the CSS object-position for the image.
 *
 * Every shot is portrait (2:3) but most frames on the site are wider, so
 * object-cover discards the top and bottom. Centred (the default) cuts the head
 * straight off: with a 2:3 source in a 16:9 frame only the middle ~37% survives,
 * and the doctor's face sits at ~15–30% from the top — i.e. outside it.
 * The Y value below is roughly where the face is, which keeps it in frame at
 * any aspect ratio. Measure it before adding a photo; do not guess.
 */
export const PHOTOS = {
  /** Close-up, scrubs, arms crossed — face large and sharp. Best for hero. */
  hero: { src: "/images/dr-kenan-hero.jpg", focus: "50% 22%" },
  /** Standing portrait, suit, clinic corridor. Tall 9:16 frame. */
  portrait: { src: "/images/dr-kenan-portrait.jpg", focus: "50% 14%" },
  /** Full length, scrubs + stethoscope, leaning on the angiography table. */
  stethoscope: { src: "/images/dr-kenan-stetoskop.jpg", focus: "50% 18%" },
  /** Arms crossed in front of the Siemens Artis angiograph. */
  angiography: { src: "/images/dr-kenan-anqioqrafiya.jpg", focus: "50% 19%" },
  /** White coat, angiography suite (Mərkəzi Klinika). */
  cathLab: { src: "/images/kabinet-anqio.jpg", focus: "50% 20%" },
  /** At the desk writing a prescription; stethoscope, no patient. */
  desk: { src: "/images/kabinet-masa.jpg", focus: "50% 31%" },
  /** Consultation — patient shown from behind, not identifiable. */
  consultation: { src: "/images/konsultasiya-qebul.jpg", focus: "50% 24%" },
  /** Cath-lab team during a procedure; patient draped. Landscape 3:2. */
  team: { src: "/images/prosedur-komanda.jpg", focus: "50% 40%" },
} as const;

/** Blog categories — shown as the "Bloq" submenu and as tabs on each list page. */
export const BLOG_CATEGORIES = [
  { label: "Bloq", href: "/blog", slug: "blog" },
  { label: "Həkimlər üçün", href: "/hekimler-ucun", slug: "hekimler-ucun" },
  { label: "Xəstəliklər", href: "/xestelikler", slug: "xestelikler" },
] as const;

/** Services submenu — the areas on /xidmetler plus the dedicated landings. */
export const SERVICE_LINKS = [
  { label: "Ürək diaqnostikası", href: "/xidmetler#diaqnostika", slug: "diaqnostika" },
  { label: "Kardioloji check-up", href: "/kardioloji-check-up", slug: "kardioloji-check-up" },
  { label: "Xəstəliklərin müalicəsi", href: "/xidmetler#mualice", slug: "mualice" },
  { label: "İnvaziv kardiologiya", href: "/xidmetler#invaziv", slug: "invaziv" },
  { label: "Onlayn konsultasiya", href: "/randevu", slug: "onlayn-konsultasiya" },
] as const;

/** Primary navigation — labels are AZ; hrefs use ASCII-folded slugs. */
export type NavItem = {
  label: string;
  href: string;
  children?: readonly { label: string; href: string; slug: string }[];
};

export const NAV: readonly NavItem[] = [
  { label: "Ana səhifə", href: "/" },
  { label: "Haqqımda", href: "/haqqimda" },
  { label: "Xidmətlər", href: "/xidmetler", children: SERVICE_LINKS },
  { label: "Bloq", href: "/blog", children: BLOG_CATEGORIES },
  { label: "Əlaqə", href: "/elaqe" },
];

export const CONTACT = {
  phone: "+994 10 382 29 99",
  phoneHref: "tel:+994103822999",
  email: "ahmadovkardio@gmail.com",
  address: "Bakı, Azərbaycan",
  emergency: "103",
} as const;

/**
 * Azerbaijani ASCII folding — CRITICAL for SEO (PROJECT-PLAN.md §5).
 * ə→e, ü→u, ç→c, ş→s, ğ→g, ö→o, ı→i, İ→i and uppercase forms.
 * Used for slugs and to seed ASCII keyword variants.
 */
const AZ_FOLD_MAP: Record<string, string> = {
  ə: "e", Ə: "e",
  ü: "u", Ü: "u",
  ç: "c", Ç: "c",
  ş: "s", Ş: "s",
  ğ: "g", Ğ: "g",
  ö: "o", Ö: "o",
  ı: "i", İ: "i",
};

export function asciiFold(input: string): string {
  return input.replace(/[əƏüÜçÇşŞğĞöÖıİ]/g, (ch) => AZ_FOLD_MAP[ch] ?? ch);
}

/** Build an ASCII, URL-safe slug from Azerbaijani text. */
export function slugify(input: string): string {
  return asciiFold(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
