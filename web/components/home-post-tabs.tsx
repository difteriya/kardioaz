"use client";

import { useState } from "react";
import { PostCard } from "./post-card";
import type { Post } from "@/lib/content";

type Cat = { slug: string; name: string; posts: Post[] };

/**
 * Home page "Son yazılar" block as tabs across the three content sections, each
 * showing that section's most recent posts as cards. Client component for the
 * tab state; the posts themselves are fetched server-side and passed in.
 */
export function HomePostTabs({ categories }: { categories: Cat[] }) {
  const [active, setActive] = useState(categories[0]?.slug);
  const current = categories.find((c) => c.slug === active) ?? categories[0];
  if (!current) return null;

  return (
    <div className="mt-10">
      <div role="tablist" aria-label="Yazı kateqoriyaları" className="flex flex-wrap gap-2 border-b border-mist">
        {categories.map((c) => {
          const on = c.slug === active;
          return (
            <button
              key={c.slug}
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c.slug)}
              className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                on
                  ? "border-teal text-teal"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {current.posts.map((post) => (
          <PostCard key={post.slug} post={post} categorySlug={post.categorySlug} />
        ))}
      </div>
    </div>
  );
}
