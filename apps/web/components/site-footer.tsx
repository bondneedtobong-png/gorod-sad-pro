import Link from "next/link";

/**
 * Подвал сайта — тёмный «земляной» якорь под светлой темой, для контраста.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-forest-700/40 bg-forest-900 py-8 text-sm text-cream/60">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>© Город-сад · Ландшафтное бюро · С 2012 года</div>
        <div className="flex gap-4">
          <Link href="/plants" className="transition hover:text-wheat-400">
            Энциклопедия растений
          </Link>
          <a href="#" className="transition hover:text-wheat-400">
            Политика конфиденциальности
          </a>
        </div>
      </div>
    </footer>
  );
}
