"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toggleFavorite } from "@/app/account/actions";
import { cn } from "@/lib/utils";

export function FavoriteRemove({ slug, className }: { slug: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    await toggleFavorite(slug);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label="Убрать из избранного"
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-pine-900/90 text-red-400 shadow ring-1 ring-white/10 backdrop-blur transition hover:bg-pine-800 disabled:opacity-50",
        className,
      )}
    >
      <Heart className="h-4 w-4 fill-current" />
    </button>
  );
}
