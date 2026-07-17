import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDoc } from "@/lib/legal";
import { LegalPage } from "@/components/legal-page";

/** Shared builders so each legal route file stays a thin wrapper. */
export function legalMetadata(slug: string): Metadata {
  const doc = getLegalDoc(slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.metaDescription,
    alternates: { canonical: `/${slug}` },
  };
}

export function LegalRoute({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug);
  if (!doc) notFound();
  return <LegalPage doc={doc} />;
}
