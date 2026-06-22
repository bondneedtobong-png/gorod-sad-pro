"use client";

import { useState } from "react";

import { updateProfile } from "@/app/account/actions";
import { inputClass, labelClass, primaryBtn } from "@/lib/ui-classes";

export function ProfileForm({
  initial,
}: {
  initial: { name: string; email: string; phone: string };
}) {
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await updateProfile({ name, phone });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Сохранено" } : { ok: false, text: res.error });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="name">Имя</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" value={initial.email} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
        <p className="mt-1 text-xs text-mist/50">Email менять нельзя — это ваш логин.</p>
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Телефон</label>
        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 (___) ___-__-__" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className={primaryBtn}>
          {busy ? "Сохраняем…" : "Сохранить"}
        </button>
        {msg && (
          <span className={msg.ok ? "text-sm text-aqua-400" : "text-sm text-red-400"}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}
