import { cn } from "@/lib/utils";

const MAP: Record<string, { label: string; cls: string }> = {
  NEW: { label: "Новая", cls: "bg-aqua-400/15 text-aqua-300 ring-aqua-400/30" },
  IN_PROGRESS: { label: "В работе", cls: "bg-sky-400/15 text-sky-300 ring-sky-400/30" },
  DONE: { label: "Выполнена", cls: "bg-emerald-500/25 text-aqua-200 ring-emerald-500/40" },
  CANCELLED: { label: "Отменена", cls: "bg-white/10 text-mist/50 ring-white/15" },
};

export function DealStatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? MAP.NEW;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", s.cls)}>
      {s.label}
    </span>
  );
}
