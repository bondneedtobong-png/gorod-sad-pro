"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toggleFavorite } from "@/app/account/actions";
import { cn } from "@/lib/utils";

/**
 * Кнопка «в избранное» для страницы растения. Сама подтягивает своё состояние
 * (авторизован ли пользователь и в избранном ли растение) — поэтому страница
 * остаётся статической/ISR, а кнопка работает как клиентский островок.
 */
export function FavoriteButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/account/favorites?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setAuthed(Boolean(d.authed));
        setFav(Boolean(d.favorited));
      })
      .catch(() => undefined);
  }, [slug]);

  async function onClick() {
    if (!authed) {
      router.push(`/login?callbackUrl=/plants/${slug}`);
      return;
    }
    setBusy(true);
    const prev = fav;
    setFav(!prev);
    const res = await toggleFavorite(slug);
    setBusy(false);
    if (!res.ok) setFav(prev);
    else setFav(res.favorited);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={fav}
      aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition",
        fav
          ? "border-red-300 bg-red-50 text-red-600"
          : "border-forest-300 text-forest-800 hover:border-wheat-600 hover:text-wheat-700",
      )}
    >
      <Heart className={cn("h-4 w-4", fav && "fill-current")} />
      {fav ? "В избранном" : "В избранное"}
    </button>
  );
}
