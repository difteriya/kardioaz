import { PulseMark } from "./pulse-mark";
import { BookingButton } from "./booking-button";

/**
 * Immersive band with a muted, looping YouTube video as the background and the
 * doctor's slogan overlaid. The iframe is pointer-events-none so it acts purely
 * as background; the CTA on top stays clickable.
 */
const VIDEO_ID = "Z8Mu_abYW78";

export function VideoBackground() {
  const src =
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
    `?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&modestbranding=1` +
    `&rel=0&playsinline=1&disablekb=1&iv_load_policy=3&showinfo=0&fs=0`;

  return (
    <section className="relative mt-24 w-full">
      <div className="relative h-[72vh] min-h-[460px] w-full overflow-hidden">
        {/* Background video (cover). Scaled up so a 16:9 video fills the band. */}
        <div className="absolute inset-0">
          <iframe
            src={src}
            title="kardio.az — ürək sağlamlığı"
            allow="autoplay; encrypted-media; picture-in-picture"
            loading="lazy"
            aria-hidden="true"
            tabIndex={-1}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[max(100%,56.25vw)] w-[max(100%,177.78vh)] -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/45" />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <PulseMark className="h-6 w-64 text-pulse/80" />
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-porcelain sm:text-5xl">
            Sağlam ürək, sağlam ruh
          </h2>
          <p className="mt-4 max-w-lg text-porcelain/80">
            Müasir diaqnostika və fərdi yanaşma ilə ürəyinizin sağlamlığını qoruyuruq.
          </p>
          <BookingButton className="mt-7 rounded-xl bg-pulse px-6 py-3 font-medium text-white shadow-soft transition-opacity hover:opacity-90" />
        </div>
      </div>
    </section>
  );
}
