import type { Metadata } from "next";
import { PostPage, postParams, postMetadata } from "@/lib/blog-routes";

const CATEGORY = "xestelikler";

export function generateStaticParams() {
  return postParams(CATEGORY);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return postMetadata(CATEGORY, slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostPage categorySlug={CATEGORY} slug={slug} />;
}
