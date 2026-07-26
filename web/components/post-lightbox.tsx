"use client";

import { useEffect, useState } from "react";

/**
 * Click-to-zoom for post images. The article body is injected via
 * dangerouslySetInnerHTML, so instead of wrapping each <img> we delegate: one
 * document-level click listener opens any image inside `.post-body` (or the
 * featured hero) in a full-screen overlay. Closes on backdrop click or Escape.
 */
export function PostLightbox() {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const SEL = ".post-body img, [data-lightbox] img";
    // Cursor affordance on every eligible image.
    document.querySelectorAll<HTMLImageElement>(SEL).forEach((el) => {
      el.style.cursor = "zoom-in";
    });

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== "IMG") return;
      if (!t.closest(".post-body, [data-lightbox]")) return;
      e.preventDefault();
      const el = t as HTMLImageElement;
      setImg({ src: el.currentSrc || el.src, alt: el.alt || "" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!img) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setImg(null);
    document.addEventListener("keydown", onKey);
    // Lock body scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [img]);

  if (!img) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={img.alt || "Şəkil"}
      onClick={() => setImg(null)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
      style={{ animation: "lb-fade .15s ease-out" }}
    >
      <button
        type="button"
        aria-label="Bağla"
        onClick={() => setImg(null)}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/20"
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        alt={img.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
      />
      <style>{`@keyframes lb-fade{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){[role=dialog]{animation:none!important}}`}</style>
    </div>
  );
}
