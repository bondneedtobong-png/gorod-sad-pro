import { cn } from "@/lib/utils";

/**
 * Метка секции — фирменный чип с точкой-«семечком».
 * Тёмная тема: по умолчанию — бирюзовый чип на тёмном фоне; `tone="light"` —
 * приглушённый светлый вариант (тоже на тёмном), а `tone="pine"` —
 * тёмный знак на светлой/бирюзовой поверхности.
 */
export function SectionLabel({
  children,
  tone = "aqua",
  className,
}: {
  children: React.ReactNode;
  tone?: "aqua" | "light" | "pine";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        tone === "aqua" && "border-aqua-400/30 bg-aqua-400/10 text-aqua-400",
        tone === "light" && "border-white/15 bg-white/5 text-mist/80",
        tone === "pine" && "border-pine-900/20 bg-pine-900/10 text-pine-900",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "pine" ? "bg-pine-900" : "bg-aqua-400",
        )}
      />
      {children}
    </span>
  );
}
