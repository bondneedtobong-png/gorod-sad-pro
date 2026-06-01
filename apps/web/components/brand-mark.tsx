interface BrandMarkProps {
  className?: string;
  /** Если задан — знак считается смысловым (role=img) с этим заголовком. */
  title?: string;
}

/**
 * Фирменный знак «Город-сад» — стилизованный лист с прожилкой и лёгким
 * «дуновением» сверху. Рисуется через `currentColor`, поэтому легко
 * перекрашивается (в шапке — wheat).
 *
 * Это аккуратная интерпретация логотипа из брендбука. Точный вектор можно
 * положить в public/logo.svg (используется как OG/скачиваемый ассет) и при
 * желании отрисовывать через <img src="/logo.svg" />.
 */
export function BrandMark({ className, title }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* тело листа */}
      <path
        d="M30 82 C 27 49, 50 27, 79 21 C 71 55, 52 79, 30 82 Z"
        fill="currentColor"
      />
      {/* центральная прожилка */}
      <path
        d="M34 78 C 43 57, 57 39, 74 26"
        stroke="#15281A"
        strokeOpacity="0.38"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* «дуновение ветра» — отсылка к динамике знака */}
      <path
        d="M16 40 C 30 22, 46 16, 60 18"
        stroke="currentColor"
        strokeOpacity="0.7"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
