"use client";

import { useRef, useState } from "react";
import { formatDateAz } from "@/lib/format";
import type { Comment } from "@/lib/comments";

/**
 * Blog comments — a moderated list plus a submission form. New comments are held
 * for the doctor's approval (see /api/comments), so nothing appears here until
 * it's cleared; the form makes that explicit.
 */
export function CommentSection({
  postId,
  comments,
}: {
  postId: number;
  comments: Comment[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const mountedAt = useRef(Date.now());

  const canSubmit =
    name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && content.trim().length >= 5;

  async function submit() {
    if (!canSubmit || status === "sending") return;
    setStatus("sending");
    setError(null);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        name,
        email,
        content,
        website,
        renderedAt: mountedAt.current,
      }),
    });
    if (res.ok) {
      setStatus("done");
      setName("");
      setEmail("");
      setContent("");
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Şərh göndərilmədi.");
      setStatus("error");
    }
  }

  return (
    <section className="mt-16 border-t border-mist pt-10">
      <p className="eyebrow eyebrow-tick">Şərhlər</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink">
        {comments.length > 0 ? `Şərhlər (${comments.length})` : "İlk şərhi siz yazın"}
      </h2>

      {/* Existing (approved) comments */}
      {comments.length > 0 && (
        <ul className="mt-8 space-y-6">
          {comments.map((c) => (
            <li key={c.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-porcelain-2 font-display text-sm font-semibold text-teal">
                  {c.author.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{c.author}</p>
                  <time dateTime={c.date} className="text-xs text-ink-soft">
                    {formatDateAz(c.date)}
                  </time>
                </div>
              </div>
              <div
                className="post-body mt-3 text-sm leading-relaxed text-ink-soft"
                dangerouslySetInnerHTML={{ __html: c.contentHtml }}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Submission form */}
      {status === "done" ? (
        <div className="mt-8 rounded-2xl border border-teal/30 bg-teal/[0.06] p-6">
          <p className="font-medium text-ink">Şərhiniz göndərildi ✓</p>
          <p className="mt-1 text-sm text-ink-soft">
            Şərh həkim tərəfindən yoxlanıldıqdan sonra dərc olunacaq.
          </p>
        </div>
      ) : (
        <div className="mt-8 card p-6">
          <h3 className="font-display text-lg font-semibold text-ink">Şərh yazın</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Şərhlər dərc olunmazdan əvvəl yoxlanılır. E-poçtunuz göstərilmir.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="block text-ink-soft">Ad</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-4 py-2.5 text-ink outline-none focus:border-teal"
              />
            </label>
            <label className="text-sm">
              <span className="block text-ink-soft">E-poçt (göstərilmir)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-mist bg-porcelain px-4 py-2.5 text-ink outline-none focus:border-teal"
              />
            </label>
          </div>

          {/* Honeypot — visually hidden, off-screen; bots fill it, humans don't. */}
          <div aria-hidden className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <label className="mt-4 block text-sm">
            <span className="block text-ink-soft">Şərh</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-1 w-full resize-y rounded-xl border border-mist bg-porcelain px-4 py-2.5 text-ink outline-none focus:border-teal"
            />
          </label>

          {error && <p className="mt-3 text-sm text-pulse">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || status === "sending"}
            className="mt-5 rounded-xl bg-teal px-6 py-2.5 font-medium text-porcelain transition-colors hover:bg-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "sending" ? "Göndərilir…" : "Şərhi göndər"}
          </button>
        </div>
      )}
    </section>
  );
}
