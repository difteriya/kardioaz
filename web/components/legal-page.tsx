import { PulseMark } from "./pulse-mark";
import { JsonLd } from "./json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import type { LegalDoc } from "@/lib/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-14">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana səhifə", url: "/" },
          { name: doc.title, url: `/${doc.slug}` },
        ])}
      />

      <p className="eyebrow">Hüquqi</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        {doc.title}
      </h1>
      <PulseMark className="mt-5 h-4 w-40 text-pulse" />

      {/* Draft notice — these documents await legal review (PROJECT-PLAN §14.9) */}
      <p className="mt-6 rounded-xl border border-mist bg-porcelain-2 px-4 py-3 text-sm text-ink-soft">
        Bu sənəd hazırlıq mərhələsindədir və hüquqi baxışdan sonra yekunlaşacaq.
      </p>

      <p className="mt-8 text-lg leading-relaxed text-ink-soft">{doc.intro}</p>

      <div className="mt-10 space-y-10">
        {doc.sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="font-display text-xl font-semibold text-ink">{s.heading}</h2>
            )}
            {s.paragraphs.map((p, j) => (
              <p key={j} className="mt-3 leading-relaxed text-ink-soft">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
