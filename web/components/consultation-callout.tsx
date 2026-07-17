import Link from "next/link";
import { VideoIcon } from "./video-icon";
import { SITE } from "@/lib/site";

/**
 * Video-consultation callout — clarifies that the booking system is an online
 * video visit. Shared by the Services and home pages.
 */
export function ConsultationCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-5 overflow-hidden rounded-2xl border border-teal/30 bg-teal/[0.06] p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8 ${className}`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/10">
          <VideoIcon className="h-6 w-6 text-teal" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Randevu sistemimiz — onlayn video konsultasiya
          </h2>
          <p className="mt-1 max-w-xl text-ink-soft">
            Randevu aldıqda həkimlə birbaşa video zəng vasitəsilə görüşürsünüz — evdən
            çıxmadan, rahat və təhlükəsiz şəkildə.
          </p>
        </div>
      </div>
      <Link
        href={SITE.bookingUrl}
        className="shrink-0 rounded-xl bg-teal px-6 py-3 text-center font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg"
      >
        Video konsultasiyaya yazıl
      </Link>
    </div>
  );
}
