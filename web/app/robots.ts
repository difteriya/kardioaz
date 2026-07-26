import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /randevu itself is the indexable online-consultation landing; only the
      // private token flows (confirm/cancel), the admin panel and live
      // consultation rooms are kept out of the index.
      disallow: ["/randevu/tesdiq", "/randevu/legv", "/admin/", "/konsultasiya/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
