import Link from "next/link";

/**
 * Подвал сайта — самый тёмный «земляной» якорь (ink) под тёмной темой.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink py-8 text-sm text-mist/55">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>© Город-сад · Ландшафтное бюро · С 2012 года</div>
        <div className="flex gap-4">
          <Link href="/plants" className="transition hover:text-aqua-400">
            Энциклопедия растений
          </Link>
          <a href="#" className="transition hover:text-aqua-400">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}
