import Link from "next/link";
import { SITE, DOCTOR, NAV, CONTACT } from "@/lib/site";
import { PulseMark } from "./pulse-mark";

const LEGAL = [
  { label: "Məxfilik siyasəti", href: "/mexfilik-siyaseti" },
  { label: "İstifadə şərtləri", href: "/istifade-sertleri" },
  { label: "Kuki siyasəti", href: "/kuki-siyaseti" },
  { label: "Tibbi bildiriş", href: "/tibbi-bildiris" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-mist/70 bg-porcelain-2">
      <div className="mx-auto max-w-6xl px-5 py-14">
        {/* Emergency notice — YMYL responsibility */}
        <p className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-pulse/25 bg-pulse/5 px-4 py-3 text-sm text-ink-soft">
          <span className="font-medium text-pulse">Təcili hallar üçün deyil.</span>
          Həyati təhlükə olan vəziyyətdə dərhal{" "}
          <a href={`tel:${CONTACT.emergency}`} className="font-semibold text-pulse underline">
            {CONTACT.emergency}
          </a>{" "}
          nömrəsinə zəng edin.
        </p>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-display text-lg font-semibold text-ink">
              kardio<span className="text-pulse">.</span>az
            </span>
            <PulseMark className="mt-2 h-2.5 w-24 text-mist" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              {DOCTOR.name} — {SITE.tagline.toLowerCase()}.
            </p>
          </div>

          <nav aria-label="Səhifələr">
            <h2 className="eyebrow mb-4">Səhifələr</h2>
            <ul className="space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft hover:text-teal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Hüquqi">
            <h2 className="eyebrow mb-4">Hüquqi</h2>
            <ul className="space-y-2.5 text-sm">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-ink-soft hover:text-teal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4">Əlaqə</h2>
            <ul className="space-y-2.5 text-sm text-ink-soft">
              <li>
                <a href={CONTACT.phoneHref} className="hover:text-teal">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-teal">
                  {CONTACT.email}
                </a>
              </li>
              <li>{CONTACT.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-mist/60 pt-6 text-xs text-ink-soft">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  );
}
