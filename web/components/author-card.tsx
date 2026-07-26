import Image from "next/image";
import Link from "next/link";
import { DOCTOR, PHOTOS } from "@/lib/site";

/**
 * Author card shown at the end of every post — the E-E-A-T signal for medical
 * (YMYL) content: a real, named cardiologist with credentials, photo and a link
 * to his profile. The article's own citations stay in the post body; this card
 * is purely the "who wrote this" trust block.
 */
export function AuthorCard() {
  return (
    <aside className="mt-14 flex items-start gap-5 rounded-2xl border border-mist bg-porcelain-2/50 p-6 sm:p-7">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-mist">
        <Image
          src={PHOTOS.hero.src}
          alt={DOCTOR.name}
          fill
          sizes="80px"
          className="object-cover"
          style={{ objectPosition: PHOTOS.hero.focus }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">Müəllif</p>
        <p className="mt-1 font-display text-lg font-semibold text-ink">{DOCTOR.name}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{DOCTOR.credentials}</p>
        <Link href="/haqqimda" className="mt-2 inline-block text-sm font-medium text-teal hover:underline">
          Müəllif haqqında →
        </Link>
      </div>
    </aside>
  );
}
