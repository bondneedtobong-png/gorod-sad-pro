import { Phone } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

const NAV = [
  { href: "/#services", label: "Услуги" },
  { href: "/plants", label: "Растения" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/#contact", label: "Контакты" },
];

/**
 * Шапка сайта (светлая тема). Переиспользуется на главной, страницах услуг
 * и в энциклопедии растений. Ссылки ведут на якоря главной (`/#...`), поэтому
 * работают с любой страницы.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-200/70 bg-cream/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-forest-900/5 ring-1 ring-forest-300/70">
            <BrandMark className="h-5 w-5 text-wheat-600" title="Город-сад" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-semibold tracking-wide text-forest-800">
              Город-сад
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-forest-500">
              ландшафтное бюро
            </div>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-forest-700 transition hover:text-wheat-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <a
          href="tel:+79370388344"
          className="hidden items-center gap-2 rounded-full bg-wheat-500 px-4 py-2 text-sm font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400 sm:flex"
        >
          <Phone className="h-4 w-4" strokeWidth={2} />
          8-937-038-83-44
        </a>
      </div>
    </header>
  );
}
