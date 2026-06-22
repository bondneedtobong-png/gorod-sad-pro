import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Замыленный, тонированный под палитру фото-фон для секций.
 * Тёмная тема: поверх фото — хвойная (pine) «вуаль», чтобы светлый текст читался.
 * Если `src` не задан — мягкий градиентный fallback в палитре.
 *
 * Точка подмены: реальные/свои фото кладутся в public/media/backgrounds/
 * (пути — в lib/media.ts), без правок компонентов.
 */

type Overlay = "hero" | "soft" | "band" | "veil" | "none";

interface Props {
  src?: string | null;
  /** alt для семантичных фото; пусто → декоративное (aria-hidden). */
  alt?: string;
  className?: string;
  blurPx?: number;
  overlay?: Overlay;
  /** мягкое затухание в тёмный снизу (для бесшовной стыковки секций). */
  fadeBottom?: boolean;
  priority?: boolean;
}

const VARIANT: Record<Overlay, string> = {
  hero: "bg-gradient-to-r from-pine-950 via-pine-950/85 to-pine-950/30",
  soft: "bg-pine-950/70",
  band: "bg-pine-950/80",
  veil: "bg-pine-950/[0.86]",
  none: "",
};

export function PhotoBackdrop({
  src,
  alt = "",
  className,
  blurPx = 0,
  overlay = "soft",
  fadeBottom = true,
  priority = false,
}: Props) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 overflow-hidden", className)}
      aria-hidden={alt ? undefined : true}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
          style={blurPx ? { filter: `blur(${blurPx}px)`, transform: "scale(1.08)" } : undefined}
        />
      ) : (
        // TODO: заменить на реальное фото (см. lib/media.ts → BACKGROUNDS)
        <div className="absolute inset-0 bg-gradient-to-br from-pine-800 via-pine-900 to-pine-950" />
      )}

      {/* лёгкая хвойная тонировка для единства цвета */}
      <div className="absolute inset-0 bg-pine-950/25" />
      {/* хвойная вуаль под читаемость светлого текста */}
      {overlay !== "none" && <div className={cn("absolute inset-0", VARIANT[overlay])} />}
      {/* затухание в тёмный снизу */}
      {fadeBottom && (
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-pine-950 to-transparent" />
      )}
    </div>
  );
}
