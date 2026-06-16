import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Новая", cls: "bg-wheat-500/20 text-wheat-700 ring-wheat-500/40" },
  IN_PROGRESS: { label: "В работе", cls: "bg-sky-500/15 text-sky-700 ring-sky-500/30" },
  DONE: { label: "Выполнена", cls: "bg-forest-500/20 text-forest-700 ring-forest-500/40" },
  CANCELLED: { label: "Отменена", cls: "bg-forest-200/60 text-forest-600 ring-forest-300/60" },
};

export function DealStatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.NEW;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", s.cls)}>
      {s.label}
    </span>
  );
}
