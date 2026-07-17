"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV, SITE } from "@/lib/site";
import { PulseMark } from "./pulse-mark";
import { VideoIcon } from "./video-icon";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-mist/70 bg-porcelain/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={SITE.name}>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl font-semibold tracking-tight text-ink">
              kardio<span className="text-pulse">.</span>az
            </span>
            <PulseMark className="mt-1 h-2 w-16 text-pulse/70" />
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) =>
            item.children ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-teal"
                >
                  {item.label}
                  <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                {/* dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="overflow-hidden rounded-2xl border border-mist bg-porcelain p-1.5 shadow-soft-lg">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className="block rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-porcelain-2 hover:text-teal"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-ink-soft transition-colors hover:text-teal"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={SITE.bookingUrl}
            className="hidden items-center gap-2 rounded-xl bg-teal px-4 py-2 text-sm font-medium text-porcelain transition-colors hover:bg-teal-deep md:inline-flex"
          >
            <VideoIcon className="h-4 w-4" />
            Randevu al
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden -mr-1 p-1 text-ink"
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            aria-expanded={open}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 bg-ink transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-mist/70 bg-porcelain px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileSub((s) => (s === item.href ? null : item.href))}
                      className="flex w-full items-center justify-between rounded-xl px-2 py-2.5 text-ink-soft hover:bg-porcelain-2"
                      aria-expanded={mobileSub === item.href}
                    >
                      {item.label}
                      <svg className={`h-4 w-4 transition-transform ${mobileSub === item.href ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {mobileSub === item.href && (
                      <ul className="ml-3 border-l border-mist pl-3">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              onClick={() => setOpen(false)}
                              className="block rounded-xl px-2 py-2 text-sm text-ink-soft hover:bg-porcelain-2 hover:text-teal"
                            >
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-2 py-2.5 text-ink-soft hover:bg-porcelain-2 hover:text-teal"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="mt-2">
              <Link
                href={SITE.bookingUrl}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 font-medium text-porcelain"
              >
                <VideoIcon className="h-4 w-4" />
                Randevu al
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
