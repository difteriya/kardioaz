import type { Category, Post, ContentSource } from "./types";
import { DOCTOR } from "@/lib/site";
import { detectPostLanguage } from "@/lib/lang";

/**
 * WordPress REST provider — reads the real content from the existing kardio.az
 * site (headless). Same ContentSource interface as the mock, so pages are
 * unchanged. Category IDs map to the preserved URL slugs (PROJECT-PLAN.md §6).
 */
const API =
  process.env.WORDPRESS_API_URL ?? "https://kardio.az/wp-json/wp/v2";

const CATEGORY_BY_ID: Record<number, string> = {
  27: "blog",
  26: "hekimler-ucun",
  61: "xestelikler",
};

const CATEGORIES: Category[] = [
  { slug: "blog", name: "Bloq", description: "Ürək sağlamlığı, profilaktika və pasiyentlər üçün faydalı yazılar." },
  { slug: "hekimler-ucun", name: "Həkimlər üçün", description: "Kardiologiya üzrə klinik materiallar və peşəkar məzmun." },
  { slug: "xestelikler", name: "Xəstəliklər", description: "Ürək-damar xəstəlikləri: əlamətlər, diaqnostika və müalicə." },
];

const CAT_ID_BY_SLUG: Record<string, number> = { blog: 27, "hekimler-ucun": 26, xestelikler: 61 };

interface WpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  featured_media: number;
  yoast_head_json?: {
    title?: string;
    description?: string;
    og_image?: { url: string }[];
  };
}

const POST_FIELDS =
  "id,slug,date,modified,title,excerpt,content,categories,yoast_head_json";

// --- small HTML helpers -----------------------------------------------------
function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function toPost(wp: WpPost): Post {
  const categorySlug = CATEGORY_BY_ID[wp.categories?.[0]] ?? "blog";
  const excerpt = stripHtml(wp.excerpt?.rendered ?? "").slice(0, 200);
  const metaDescription =
    wp.yoast_head_json?.description?.trim() || excerpt || decodeEntities(wp.title.rendered);
  return {
    slug: decodeURIComponent(wp.slug),
    title: decodeEntities(wp.title.rendered),
    excerpt,
    contentHtml: wp.content?.rendered ?? "",
    categorySlug,
    publishedAt: wp.date,
    updatedAt: wp.modified,
    author: DOCTOR.name,
    readingMinutes: readingMinutes(wp.content?.rendered ?? ""),
    language: detectPostLanguage(`${decodeEntities(wp.title.rendered)} ${excerpt}`),
    featuredImage: wp.yoast_head_json?.og_image?.[0]?.url,
    seo: {
      // Strip Yoast's " - Kardio.az" suffix; our metadata template re-adds the brand.
      title: wp.yoast_head_json?.title
        ?.replace(/\s*[-–—|]\s*kardio\.az\s*$/i, "")
        .trim(),
      metaDescription,
      keywords: [],
    },
  };
}

async function wpFetch(path: string): Promise<WpPost[]> {
  const res = await fetch(`${API}${path}`, {
    // Time-based ISR is the floor: the site self-heals hourly even with no
    // webhook. The /api/revalidate route makes a WordPress publish instant by
    // purging the whole layout on demand.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${path}`);
  return (await res.json()) as WpPost[];
}

export const wordpressContent: ContentSource = {
  async getCategories() {
    return CATEGORIES;
  },
  async getCategory(slug) {
    return CATEGORIES.find((c) => c.slug === slug) ?? null;
  },
  async getAllPosts() {
    const posts = await wpFetch(`/posts?per_page=100&_fields=${POST_FIELDS}`);
    return posts.map(toPost);
  },
  async getPostsByCategory(categorySlug) {
    const id = CAT_ID_BY_SLUG[categorySlug];
    if (!id) return [];
    const posts = await wpFetch(
      `/posts?per_page=100&categories=${id}&_fields=${POST_FIELDS}`,
    );
    return posts.map(toPost);
  },
  async getPost(slug) {
    // WP stores slugs URL-encoded; query by the encoded form.
    const encoded = encodeURIComponent(slug);
    const posts = await wpFetch(`/posts?slug=${encoded}&_fields=${POST_FIELDS}`);
    if (posts.length === 0) {
      // fallback: some slugs round-trip differently — try raw
      const alt = await wpFetch(`/posts?slug=${slug}&_fields=${POST_FIELDS}`);
      return alt.length ? toPost(alt[0]) : null;
    }
    return toPost(posts[0]);
  },
};
