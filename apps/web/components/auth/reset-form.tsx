"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authInputClass, authPrimaryBtn } from "@/components/auth/auth-shell";

const labelClass = "mb-1.5 block text-sm font-medium text-mist/80";

export function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-mist/72">
          Ссылка недействительна или устарела. Запросите сброс пароля заново.
        </p>
        <Link href="/forgot-password" className="inline-block text-sm font-medium text-aqua-400 hover:underline">
          Запросить ссылку
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Минимум 8 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setBusy(false);
    if (res.ok) router.push("/login?reset=1");
    else setError("Ссылка устарела или недействительна. Запросите сброс заново.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="password">Новый пароль</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} placeholder="Минимум 8 символов" />
      </div>
      <div>
        <label className={labelClass} htmlFor="confirm">Повторите пароль</label>
        <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={authInputClass} placeholder="Ещё раз" />
      </div>
      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className={authPrimaryBtn}>
        {busy ? "Сохраняем…" : "Сохранить пароль"}
      </button>
    </form>
  );
}
