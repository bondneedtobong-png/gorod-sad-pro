import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Замыленный, тонированный под палитру фото-фон для секций.
 * Светлая тема: поверх фото — кремовая «вуаль», чтобы тёмно-зелёный текст читался.
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
  /** мягкое затухание в кремовый снизу (для бесшовной стыковки секций). */
  fadeBottom?: boolean;
  priority?: boolean;
}

const VARIANT: Record<Overlay, string> = {
  hero: "bg-gradient-to-r from-canvas via-canvas/85 to-canvas/30",
  soft: "bg-canvas/70",
  band: "bg-canvas/80",
  veil: "bg-canvas/[0.88]",
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
        <div className="absolute inset-0 bg-gradient-to-br from-forest-300 via-canvas to-wheat-300" />
      )}

      {/* лёгкая шалфейная тонировка для единства цвета */}
      <div className="absolute inset-0 bg-forest-400/10" />
      {/* кремовая вуаль под читаемость текста */}
      {overlay !== "none" && <div className={cn("absolute inset-0", VARIANT[overlay])} />}
      {/* затухание в кремовый снизу */}
      {fadeBottom && (
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas to-transparent" />
      )}
    </div>
  );
}
