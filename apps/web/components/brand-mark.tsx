"use client";

interface BrandMarkProps {
  className?: string;
  /** Анимировать «прорисовку» при монтировании (для героя/шапки). */
  animated?: boolean;
  title?: string;
}

/**
 * Фирменный знак «Город-сад» — буква G как лист с прожилкой-росчерком.
 * Белая часть рисуется через currentColor (легко перекрашивается, в шапке —
 * text-mist), бирюзовый росчерк — фиксированный акцент #2EE6CD.
 *
 * animated=true запускает анимацию gs-draw (@keyframes в globals.css):
 * линия «прорисовывает» знак за ~2 c. В покое оборачивающий элемент можно
 * анимировать gs-breathe + gs-glow (см. герой на главной).
 */
export function BrandMark({ className, animated, title }: BrandMarkProps) {
  const draw = (delay: number, dur: number) =>
    animated
      ? {
          strokeDasharray: 560,
          strokeDashoffset: 560,
          animation: `gs-draw ${dur}s ${delay}s cubic-bezier(.6,0,.2,1) forwards`,
        }
      : undefined;

  return (
    <svg
      viewBox="0 0 128 104"
      fill="none"
      className={className}
      style={{ overflow: "visible" }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* тело-«бокал» буквы G (лист) */}
      <path
        d="M101 39 C99 26 80 18 57 20 C31 22 16 37 16 55 C16 73 32 86 57 84 C80 82 99 73 101 58"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={draw(0.1, 1.6)}
      />
      {/* перекладина G */}
      <path
        d="M101 58 C90 59 80 57 71 58"
        stroke="currentColor"
        strokeWidth={11}
        strokeLinecap="round"
        style={draw(1.25, 1)}
      />
      {/* прожилка-росчерк — бирюзовый акцент */}
      <path
        d="M30 70 C54 60 80 50 120 26"
        stroke="#2EE6CD"
        strokeWidth={11}
        strokeLinecap="round"
        style={draw(0.8, 1.1)}
      />
    </svg>
  );
}
