import { Phone } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { HeaderUser } from "@/components/header-user";

const NAV = [
  { href: "/#services", label: "Услуги" },
  { href: "/plants", label: "Растения" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/#contact", label: "Контакты" },
];

/**
 * Шапка сайта (тёмная тема). Переиспользуется на главной, страницах услуг
 * и в энциклопедии растений. Ссылки ведут на якоря главной (`/#...`), поэтому
 * работают с любой страницы. Стекло — pine-950/72 с blur, как в бренд-гайде.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-pine-950/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
            <BrandMark className="w-6 text-mist" title="Город-сад" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold tracking-wide text-mist">
              Город-сад
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-mist/50">
              ландшафтное бюро
            </div>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-mist/75 transition hover:text-aqua-400"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+79370388344"
            className="hidden items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-mist transition hover:border-aqua-400 hover:text-aqua-400 lg:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            8-937-038-83-44
          </a>
          <HeaderUser />
        </div>
      </div>
    </header>
  );
}
