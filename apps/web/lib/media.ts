/**
 * Единая точка подмены медиа-ассетов.
 *
 * Сейчас реальных фото/видео почти нет — компоненты показывают изящные
 * плейсхолдеры. Чтобы подключить настоящий ассет, достаточно положить файл
 * в `public/media/` и прописать путь здесь. Код компонентов менять не нужно.
 */

/**
 * Фоновое видео hero-секции.
 * null → показываем анимированный SVG/градиентный fallback (он и так часть дизайна).
 *
 * TODO: положить нейро-видео в public/media/hero.mp4 (+ постер) и раскомментировать.
 */
export const HERO_VIDEO: { src: string; poster?: string } | null = null;
// export const HERO_VIDEO = { src: "/media/hero.mp4", poster: "/media/hero-poster.jpg" };

/**
 * Фоновые фото (замыленные, тонированные под палитру).
 * Сейчас — license-free стоковые снимки садов. Чтобы поставить свои —
 * замените файлы в public/media/backgrounds/ под теми же именами.
 */
export const BACKGROUNDS = {
  hero: "/media/backgrounds/hero.jpg",
  heroAccent: "/media/backgrounds/hero-accent.jpg",
  about: "/media/backgrounds/about.jpg",
  plants: "/media/backgrounds/plants.jpg",
  encyclopedia: "/media/backgrounds/encyclopedia.jpg",
} as const;

export interface BeforeAfterCase {
  /** Левое («Было») изображение. null → красивый CSS/SVG-плейсхолдер. */
  before: string | null;
  /** Правое («Стало») изображение. null → красивый CSS/SVG-плейсхолдер. */
  after: string | null;
  /** Подпись кейса под слайдером. */
  caption?: string;
}

/**
 * Кейсы для слайдера «Было / Стало».
 *
 * TODO: заменить плейсхолдеры на реальные парные фото до/после
 *       (положить в public/media/cases/ и указать пути src).
 *       Можно добавить несколько кейсов — компонент покажет первый.
 */
export const BEFORE_AFTER_CASES: BeforeAfterCase[] = [
  {
    before: null,
    after: null,
    caption: "Участок 12 соток · от голой земли до сада под ключ",
  },
];
