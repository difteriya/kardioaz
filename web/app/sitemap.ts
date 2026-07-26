import type { MetadataRoute } from "next";
import { content } from "@/lib/content";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticPages = ["", "/haqqimda", "/xidmetler", "/kardioloji-check-up", "/randevu", "/blog", "/hekimler-ucun", "/xestelikler", "/elaqe"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );

  const posts = await content.getAllPosts();
  const postPages = posts.map((post) => ({
    url: `${base}/${post.categorySlug}/${post.slug}`,
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages];
}
