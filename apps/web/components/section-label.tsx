import { cn } from "@/lib/utils";

/**
 * Метка секции — фирменный чип с точкой-«семечком».
 * Заменяет прежний «дефис + текст» эйбрау на свой узнаваемый приём.
 */
export function SectionLabel({
  children,
  tone = "forest",
  className,
}: {
  children: React.ReactNode;
  tone?: "forest" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        tone === "light"
          ? "border-cream/30 bg-cream/5 text-wheat-300"
          : "border-forest-300/70 bg-forest-50 text-forest-600",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "light" ? "bg-wheat-300" : "bg-wheat-600",
        )}
      />
      {children}
    </span>
  );
}
