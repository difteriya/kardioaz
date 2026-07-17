import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/content";
import { formatDateAz } from "@/lib/format";
import { LANG_LABEL } from "@/lib/lang";

export function PostCard({ post, categorySlug }: { post: Post; categorySlug: string }) {
  return (
    <Link
      href={`/${categorySlug}/${post.slug}`}
      className="card card-hover group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-porcelain-2">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl font-semibold text-teal/20">kardio.az</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 text-xs text-ink-soft">
          <time dateTime={post.publishedAt} className="eyebrow text-ink-soft">
            {formatDateAz(post.publishedAt)}
          </time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} dəq</span>
          <span className="ml-auto rounded-full border border-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal">
            {LANG_LABEL[post.language]}
          </span>
        </div>
        <h3 className="line-clamp-2 font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-teal">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </Link>
  );
}
