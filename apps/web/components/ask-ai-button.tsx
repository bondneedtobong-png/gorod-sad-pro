"use client";

import { Sparkles } from "lucide-react";

import { askAiAbout } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

/**
 * Кнопка «Спросить ИИ про это растение» — открывает чат-виджет
 * с предзаполненным вопросом (пользователь дослыает сам).
 */
export function AskAiButton({
  plantName,
  className,
}: {
  plantName: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        askAiAbout(`Расскажите про ${plantName} — подойдёт ли для моего участка?`)
      }
      aria-label={`Спросить ИИ про растение ${plantName}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gs-fresh px-5 py-3 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110",
        className,
      )}
    >
      <Sparkles className="h-4 w-4" /> Спросить ИИ про это растение
    </button>
  );
}
