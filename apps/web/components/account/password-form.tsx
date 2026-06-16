"use client";

import { useState } from "react";

import { changePassword } from "@/app/account/actions";
import { inputClass, labelClass, primaryBtn } from "@/lib/ui-classes";

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await changePassword({ current, next });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Пароль обновлён" });
      setCurrent("");
      setNext("");
    } else {
      setMsg({ ok: false, text: res.error });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hasPassword && (
        <div>
          <label className={labelClass} htmlFor="current">Текущий пароль</label>
          <input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
        </div>
      )}
      <div>
        <label className={labelClass} htmlFor="next">Новый пароль</label>
        <input id="next" type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} placeholder="Минимум 8 символов" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? "Сохраняем…" : hasPassword ? "Сменить пароль" : "Задать пароль"}
        </button>
        {msg && (
          <span className={msg.ok ? "text-sm text-forest-600" : "text-sm text-red-700"}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}
