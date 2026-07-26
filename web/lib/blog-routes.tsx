import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { content } from "@/lib/content";
import { CategoryView } from "@/components/category-view";
import { PostView } from "@/components/post-view";
import redirects from "@/lib/redirects-301.json";

/**
 * Shared builders for the three category URL spaces (/blog, /hekimler-ucun,
 * /xestelikler) so each route file stays a thin wrapper. Preserves existing WP
 * URL structure (PROJECT-PLAN.md §6).
 */

/**
 * Old-site → new-site 301s. The old WordPress slugs contain Azerbaijani letters
 * (ə/ü/ç/ş/ğ/ö/ı); the migration folded them to ASCII. We redirect the old path
 * to the new one to preserve SEO for every already-indexed URL.
 *
 * This lives in the page (SSR) rather than next.config redirects() OR
 * middleware: the framework's redirects() mishandles non-ASCII sources, and
 * Phusion Passenger (the Plesk runtime) does not execute Next.js middleware at
 * all. A redirect thrown from the server component always works. See
 * migration/README.md.
 */
const REDIRECT_MAP = new Map<string, string>(
  (redirects as { source: string; destination: string }[]).map((r) => [
    r.source.replace(/\/+$/, ""),
    r.destination,
  ]),
);

/**
 * If `slug` under `categorySlug` is a known old slug, 308-redirect to the new
 * path (throws, so it never returns). The route param arrives percent-encoded,
 * so decode it to match the literal-letter keys. No match → returns, caller
 * proceeds to notFound().
 */
function redirectIfOldSlug(categorySlug: string, slug: string): void {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return;
  }
  const dest = REDIRECT_MAP.get(`/${categorySlug}/${decoded}`.replace(/\/+$/, ""));
  if (dest) permanentRedirect(dest);
}

export async function categoryMetadata(categorySlug: string): Promise<Metadata> {
  const category = await content.getCategory(categorySlug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/${categorySlug}` },
  };
}

export async function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const category = await content.getCategory(categorySlug);
  if (!category) notFound();
  const posts = await content.getPostsByCategory(categorySlug);
  return <CategoryView category={category} posts={posts} />;
}

export async function postParams(categorySlug: string) {
  const posts = await content.getPostsByCategory(categorySlug);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function postMetadata(categorySlug: string, slug: string): Promise<Metadata> {
  const post = await content.getPost(slug);
  if (!post || post.categorySlug !== categorySlug) return {};
  return {
    title: post.seo.title ?? post.title,
    description: post.seo.metaDescription,
    keywords: post.seo.keywords,
    alternates: { canonical: `/${categorySlug}/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.seo.metaDescription,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

export async function PostPage({
  categorySlug,
  slug,
}: {
  categorySlug: string;
  slug: string;
}) {
  const post = await content.getPost(slug);
  if (!post || post.categorySlug !== categorySlug) {
    // Missing here — but it may be an old Azerbaijani-letter slug; 301 to the
    // new ASCII path before giving up.
    redirectIfOldSlug(categorySlug, slug);
    notFound();
  }
  const category = await content.getCategory(categorySlug);
  if (!category) notFound();
  // Exclude the current post by the RESOLVED post's slug, never the route param:
  // WP slugs are percent-encoded (`x%c9%99st…`) and the provider decodes them, but
  // the route param arrives still encoded — so `p.slug !== slug` silently never
  // matched and every post listed itself under "Oxşar yazılar". Both sides here
  // come through the same provider mapping, so they are normalised the same way.
  const related = (await content.getPostsByCategory(categorySlug))
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);
  return <PostView post={post} category={category} related={related} />;
}
