import Link from "next/link";
import Image from "next/image";
import type { Category, Post } from "@/lib/content";
import { RelatedCard } from "./related-card";
import { PulseMark } from "./pulse-mark";
import { PostCta } from "./post-cta";
import { AuthorCard } from "./author-card";
import { CommentSection } from "./comment-section";
import { JsonLd } from "./json-ld";
import { listComments } from "@/lib/comments";
import { splitHtmlIntoSections } from "@/lib/html";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { formatDateAz } from "@/lib/format";
import { LANG_LABEL } from "@/lib/lang";
import { DOCTOR, SITE } from "@/lib/site";

export async function PostView({
  post,
  category,
  related,
}: {
  post: Post;
  category: Category;
  related: Post[];
}) {
  const comments = post.wpId ? await listComments(post.wpId) : [];
  const schemas: object[] = [
    articleSchema(post, category.slug),
    breadcrumbSchema([
      { name: "Ana səhifə", url: "/" },
      { name: category.name, url: `/${category.slug}` },
      { name: post.title, url: `/${category.slug}/${post.slug}` },
    ]),
  ];
  if (post.faq?.length) schemas.push(faqSchema(post.faq));

  const sections = splitHtmlIntoSections(post.contentHtml);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <JsonLd data={schemas} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        {/* Main column */}
        <article className="min-w-0">
          <nav className="flex items-center gap-2 text-sm text-ink-soft" aria-label="Naviqasiya">
            <Link href={`/${category.slug}`} className="hover:text-teal">
              {category.name}
            </Link>
            <span aria-hidden>·</span>
            <span className="rounded-full border border-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal">
              {LANG_LABEL[post.language]}
            </span>
          </nav>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatDateAz(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingMinutes} dəq oxu</span>
          </div>
          <PulseMark className="mt-6 h-4 w-40 text-pulse" />

          {post.featuredImage && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-mist bg-porcelain-2 shadow-soft">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover"
              />
            </div>
          )}

          {/* Body, interrupted by booking CTAs — one for a normal post, up to
              three spread evenly through a very long one. Every cut lands on a
              top-level block boundary; see splitHtmlIntoSections. */}
          {sections.map((html, i) => (
            <div key={i}>
              <div
                className={`post-body text-lg leading-relaxed text-ink-soft ${i === 0 ? "mt-8" : ""}`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              {/* Not after the last section — the closing CTA below covers that. */}
              {i < sections.length - 1 && <PostCta />}
            </div>
          ))}

          {/* FAQ — mirrors the FAQPage schema */}
          {post.faq?.length ? (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                Tez-tez verilən suallar
              </h2>
              <dl className="mt-5 divide-y divide-mist overflow-hidden rounded-2xl border border-mist">
                {post.faq.map((f) => (
                  <div key={f.question} className="p-5">
                    <dt className="font-medium text-ink">{f.question}</dt>
                    <dd className="mt-2 text-ink-soft">{f.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* Author E-E-A-T card — who wrote this (medical/YMYL trust signal). */}
          <AuthorCard />

          {/* Closing CTA — after the FAQ, so it is the last thing read. A reader
              who finished the whole article is the warmest audience on the page. */}
          <PostCta />

          {/* Comments — moderated; new ones held for approval (see /api/comments) */}
          {post.wpId && <CommentSection postId={post.wpId} comments={comments} />}
        </article>

        {/* Sidebar */}
        <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
          {/* Author E-E-A-T */}
          <div className="card flex items-start gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-porcelain-2 font-display font-semibold text-teal">
              {DOCTOR.firstName[0]}
              {DOCTOR.lastName[0]}
            </span>
            <div>
              <p className="font-medium text-ink">{DOCTOR.name}</p>
              <p className="text-sm text-ink-soft">{DOCTOR.credentials}</p>
              <Link href="/haqqimda" className="mt-1 inline-block text-sm text-teal hover:underline">
                Müəllif haqqında →
              </Link>
            </div>
          </div>

          {/* Booking CTA now lives mid-article, not here — see PostCta. */}

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="eyebrow eyebrow-tick mb-4">Oxşar yazılar</h2>
              <div className="grid gap-4">
                {related.map((r) => (
                  <RelatedCard key={r.slug} post={r} categorySlug={r.categorySlug} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
