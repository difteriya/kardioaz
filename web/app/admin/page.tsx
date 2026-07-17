import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <p className="eyebrow">Həkim paneli</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
        İdarəetmə
      </h1>
      <div className="mt-10">
        <AdminPanel />
      </div>
    </div>
  );
}
