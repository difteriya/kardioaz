import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/site";

/** Category switcher — all three blog categories, active one highlighted. */
export function CategoryTabs({ active }: { active: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Bloq kateqoriyaları">
      {BLOG_CATEGORIES.map((c) => {
        const isActive = c.slug === active;
        return (
          <Link
            key={c.slug}
            href={c.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-full bg-teal px-4 py-2 text-sm font-medium text-porcelain shadow-soft"
                : "rounded-full border border-mist bg-porcelain px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
            }
          >
            {c.label}
          </Link>
        );
      })}
    </nav>
  );
}
