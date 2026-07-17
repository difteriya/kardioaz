/**
 * Content model for kardio.az.
 *
 * This is the boundary between the frontend and the content backend. Today it is
 * served by a mock provider (mock.ts); later a WPGraphQL + Yoast SEO provider will
 * implement the same `ContentSource` interface with zero page-level changes.
 * See PROJECT-PLAN.md §3 / §10 (Phase 0–2).
 */

export interface Category {
  /** URL segment, ASCII-folded (e.g. "hekimler-ucun"). Preserves existing WP URLs. */
  slug: string;
  /** Display name in Azerbaijani (proper spelling). */
  name: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PostSeo {
  /** <title> — falls back to post title if omitted. */
  title?: string;
  metaDescription: string;
  /** Both proper + ASCII-folded variants (PROJECT-PLAN.md §5). */
  keywords: string[];
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** Body as simple HTML (mock). WP provider will return rendered HTML too. */
  contentHtml: string;
  categorySlug: string;
  /** ISO date. */
  publishedAt: string;
  updatedAt?: string;
  author: string;
  readingMinutes: number;
  /** Detected post language (site is AZ-first with some EN/DE posts). */
  language: import("@/lib/lang").PostLang;
  /** Featured image URL (from WP / Yoast og:image). */
  featuredImage?: string;
  seo: PostSeo;
  faq?: FaqItem[];
}

export interface ContentSource {
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  getAllPosts(): Promise<Post[]>;
  getPostsByCategory(categorySlug: string): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;
}
