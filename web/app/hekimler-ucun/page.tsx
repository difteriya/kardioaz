import type { Metadata } from "next";
import { CategoryPage, categoryMetadata } from "@/lib/blog-routes";

export const generateMetadata = (): Promise<Metadata> => categoryMetadata("hekimler-ucun");

export default function Page() {
  return <CategoryPage categorySlug="hekimler-ucun" />;
}
