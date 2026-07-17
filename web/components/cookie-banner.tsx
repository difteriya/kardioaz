"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "kardio-cookie-consent";

/** Privacy-first cookie banner: analytics stay off until explicitly accepted. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — skip */
    }
  }, []);

  function decide(value: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-mist bg-porcelain/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Saytın işləməsi üçün zəruri kukilərdən istifadə edirik. Analitik kukilər yalnız
          razılığınızla aktivləşir.{" "}
          <Link href="/kuki-siyaseti" className="text-teal underline">
            Kuki siyasəti
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("declined")}
            className="rounded-xl border border-mist px-4 py-2 text-sm text-ink hover:border-teal hover:text-teal"
          >
            Yalnız zəruri
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-medium text-porcelain hover:bg-teal-deep"
          >
            Qəbul et
          </button>
        </div>
      </div>
    </div>
  );
}
