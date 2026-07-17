import type { Metadata } from "next";
import { CategoryPage, categoryMetadata } from "@/lib/blog-routes";

export const generateMetadata = (): Promise<Metadata> => categoryMetadata("blog");

export default function Page() {
  return <CategoryPage categorySlug="blog" />;
}
