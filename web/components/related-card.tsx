import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/content";
import { formatDateAz } from "@/lib/format";
import { LANG_LABEL } from "@/lib/lang";

/** Compact related-post card: thumbnail + text, meant to stack vertically. */
export function RelatedCard({ post, categorySlug }: { post: Post; categorySlug: string }) {
  return (
    <Link
      href={`/${categorySlug}/${post.slug}`}
      className="card card-hover group flex gap-4 overflow-hidden"
    >
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden bg-porcelain-2 sm:w-32">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="128px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-sm font-semibold text-teal/25">kardio.az</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-1.5 py-3 pr-4">
        <div className="flex items-center gap-2 text-[11px] text-ink-soft">
          <time dateTime={post.publishedAt}>{formatDateAz(post.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} dəq</span>
          <span className="rounded-full border border-mist px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-teal">
            {LANG_LABEL[post.language]}
          </span>
        </div>
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink group-hover:text-teal">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </Link>
  );
}
