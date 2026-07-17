import type { Metadata } from "next";
import { TokenAction } from "@/components/token-action";

export const metadata: Metadata = {
  title: "Randevu ləğvi",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <TokenAction mode="cancel" token={token ?? ""} />;
}
