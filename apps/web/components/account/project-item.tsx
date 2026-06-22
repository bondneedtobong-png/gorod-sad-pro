"use client";

import { LayoutGrid, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProject, renameProject } from "@/app/account/actions";
import { formatRub } from "@/lib/api";
import { cardClass, inputClass } from "@/lib/ui-classes";

export function ProjectItem({
  id,
  name,
  estimateRub,
  updatedAt,
}: {
  id: string;
  name: string;
  estimateRub: number | null;
  updatedAt: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(name);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await renameProject(id, val);
    setBusy(false);
    setEditing(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("Удалить проект безвозвратно?")) return;
    setBusy(true);
    await deleteProject(id);
    router.refresh();
  }

  return (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input value={val} onChange={(e) => setVal(e.target.value)} className={`${inputClass} max-w-xs`} />
              <button onClick={save} disabled={busy} className="text-sm font-medium text-aqua-400">Сохранить</button>
            </div>
          ) : (
            <>
              <div className="font-display text-lg text-mist">{name}</div>
              <div className="text-xs text-mist/50">
                Обновлён {new Date(updatedAt).toLocaleDateString("ru-RU")}
                {estimateRub != null && ` · ${formatRub(estimateRub)}`}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/sandbox?project=${id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-gs-fresh px-4 py-2 text-sm font-semibold text-pine-950 transition hover:brightness-110"
          >
            <LayoutGrid className="h-4 w-4" /> Открыть
          </Link>
          {!editing && (
            <button onClick={() => setEditing(true)} aria-label="Переименовать" className="grid h-9 w-9 place-items-center rounded-full text-mist/60 transition hover:bg-white/5">
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button onClick={remove} disabled={busy} aria-label="Удалить" className="grid h-9 w-9 place-items-center rounded-full text-red-400 transition hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
