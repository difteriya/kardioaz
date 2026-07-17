import type { Category, Post } from "@/lib/content";
import { PostCard } from "./post-card";
import { CategoryTabs } from "./category-tabs";
import { JsonLd } from "./json-ld";
import { PulseMark } from "./pulse-mark";
import { breadcrumbSchema } from "@/lib/schema";

export function CategoryView({
  category,
  posts,
}: {
  category: Category;
  posts: Post[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana səhifə", url: "/" },
          { name: "Bloq", url: "/blog" },
          { name: category.name, url: `/${category.slug}` },
        ])}
      />

      <p className="eyebrow eyebrow-tick">Bloq</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        {category.name}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-soft">{category.description}</p>
      <PulseMark className="mt-5 h-4 w-40 text-pulse" />

      {/* Category switcher — all three, active highlighted */}
      <div className="mt-8">
        <CategoryTabs active={category.slug} />
      </div>

      {posts.length === 0 ? (
        <p className="mt-14 text-ink-soft">Bu kateqoriyada hələ yazı yoxdur.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
