"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";

interface Ctx {
  title: string;
  desc: string;
  actions: { label: string; href: string; primary?: boolean }[];
}

/**
 * Context-aware 404. Next renders this for unmatched URLs *and* for notFound()
 * thrown in segments (e.g. a dead consultation link), so we key the copy off the
 * pathname to explain what actually went wrong instead of a generic message.
 */
function contextFor(path: string): Ctx {
  if (path.startsWith("/konsultasiya")) {
    return {
      title: "Konsultasiya tapılmadı",
      desc: "Bu konsultasiya keçidi artıq etibarlı deyil. Randevu ləğv edilmiş, tamamlanmış ola bilər və ya keçid köhnəlib.",
      actions: [
        { label: "Yeni randevu al", href: SITE.bookingUrl, primary: true },
        { label: "Ana səhifə", href: "/" },
      ],
    };
  }
  if (path.startsWith("/randevu")) {
    return {
      title: "Randevu keçidi etibarlı deyil",
      desc: "Bu keçid köhnəlib və ya təsdiq müddəti bitib. Zəhmət olmasa yenidən uyğun vaxt seçin.",
      actions: [
        { label: "Yeni randevu al", href: SITE.bookingUrl, primary: true },
        { label: "Ana səhifə", href: "/" },
      ],
    };
  }
  if (/^\/(blog|hekimler-ucun|xestelikler)/.test(path)) {
    return {
      title: "Yazı tapılmadı",
      desc: "Axtardığınız yazı mövcud deyil və ya ünvanı dəyişib. Bloqdan digər yazılara baxa bilərsiniz.",
      actions: [
        { label: "Bloqa qayıt", href: "/blog", primary: true },
        { label: "Ana səhifə", href: "/" },
      ],
    };
  }
  return {
    title: "Səhifə tapılmadı",
    desc: "Axtardığınız səhifə mövcud deyil və ya köçürülüb. Aşağıdakı bölmələrdən davam edə bilərsiniz.",
    actions: [
      { label: "Ana səhifə", href: "/", primary: true },
      { label: "Xidmətlər", href: "/xidmetler" },
      { label: "Bloq", href: "/blog" },
    ],
  };
}

/** A heartbeat that flatlines — the brand signature, but with no pulse left. */
function Flatline() {
  return (
    <svg
      viewBox="0 0 240 40"
      fill="none"
      aria-hidden="true"
      className="mx-auto h-10 w-full max-w-sm text-pulse"
      preserveAspectRatio="none"
    >
      <path
        d="M0 20 H48 L54 20 L60 8 L68 32 L76 20 H240"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="pulse-travel-path"
      />
      <path
        d="M0 20 H48 L54 20 L60 8 L68 32 L76 20 H240"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.18}
      />
    </svg>
  );
}

export default function NotFound() {
  const pathname = usePathname() ?? "";
  const ctx = contextFor(pathname);

  return (
    <div className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex min-h-[calc(100svh-73px)] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <p className="eyebrow eyebrow-tick">404</p>

        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {ctx.title}
        </h1>

        <div className="mt-8 w-full">
          <Flatline />
        </div>

        <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-soft">{ctx.desc}</p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {ctx.actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={
                a.primary
                  ? "rounded-xl bg-teal px-6 py-3 font-medium text-porcelain shadow-soft transition-all hover:bg-teal-deep hover:shadow-soft-lg"
                  : "rounded-xl border border-mist bg-porcelain/70 px-6 py-3 font-medium text-ink transition-colors hover:border-teal hover:text-teal"
              }
            >
              {a.label}
            </Link>
          ))}
        </div>

        {pathname && (
          <p className="mt-8 font-mono text-xs text-ink-soft/70">{pathname}</p>
        )}
      </div>
    </div>
  );
}
