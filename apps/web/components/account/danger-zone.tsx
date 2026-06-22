"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

import { deleteAccount } from "@/app/account/actions";

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    setBusy(true);
    const res = await deleteAccount();
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-mist">Удаление аккаунта</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-mist/60">
        Аккаунт и связанные данные (профиль, избранное, сохранённые проекты) будут
        удалены безвозвратно. Заявки сохранятся у бюро, но без привязки к вам.
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/50 px-5 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10"
        >
          Удалить аккаунт
        </button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? "Удаляем…" : "Да, удалить навсегда"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className="text-sm text-mist/60 hover:text-mist"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}
