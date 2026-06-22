"use client";

import { Leaf } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Фото растения через next/image с изящным fallback.
 * Пока фото нет — показывается палитровая заглушка (градиент + лист + имя),
 * а не «битая картинка». Как только файл появится в public/media/plants/
 * под именем из поля image — он отрисуется автоматически (onError → fallback).
 *
 * TODO: заменить на реальные фото в public/media/plants/<slug>.jpg
 */

interface Props {
  src?: string | null;
  /** имя растения — для alt и подписи на заглушке */
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function PlantImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-pine-800", className)}>
      {showImage ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-pine-700 via-pine-900 to-emerald-600">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(46,230,205,0.28), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 90%, rgba(4,34,27,0.55), transparent 60%)",
            }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <Leaf className="h-10 w-10 text-mist/30" strokeWidth={1.6} />
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/70 to-transparent p-3">
            <span className="font-display text-sm text-mist drop-shadow">{alt}</span>
          </div>
        </div>
      )}
    </div>
  );
}
