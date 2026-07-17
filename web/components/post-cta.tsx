import { PulseMark } from "./pulse-mark";
import { BookingButton } from "./booking-button";

/**
 * In-article booking CTA, dropped into the middle of a post.
 *
 * Placed mid-content rather than in the sidebar: a reader deep in an article
 * about their symptoms is the moment the offer is relevant, and sidebars are
 * both banner-blind on desktop and pushed far below the text on mobile.
 *
 * `not-prose`-style resets are unnecessary because .post-body only styles
 * elements, but the negative-margin trick lets it breathe slightly wider than
 * the text column on larger screens.
 */
export function PostCta({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="Onlayn konsultasiya"
      className={`my-12 flex flex-col items-center gap-5 overflow-hidden rounded-2xl bg-ink px-6 py-8 text-center shadow-soft-lg sm:flex-row sm:justify-between sm:text-left sm:px-8 ${className}`}
    >
      <div className="flex flex-col items-center sm:items-start">
        <PulseMark className="h-4 w-32 text-pulse/70" loop />
        <p className="mt-3 font-display text-xl font-semibold leading-snug text-porcelain">
          Ürəyiniz üçün onlayn konsultasiya
        </p>
        <p className="mt-1.5 max-w-md text-sm text-porcelain/70">
          Dr. Kənan Əhmədov ilə video zəng vasitəsilə görüşün — evdən çıxmadan.
        </p>
      </div>
      <BookingButton className="shrink-0 rounded-xl bg-pulse px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90" />
    </aside>
  );
}
