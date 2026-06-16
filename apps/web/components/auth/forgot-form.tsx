"use client";

import Link from "next/link";
import { useState } from "react";

import { authInputClass, authPrimaryBtn } from "@/components/auth/auth-shell";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-forest-700">
          Если аккаунт с таким email существует, мы отправили письмо со ссылкой для
          сброса пароля. Проверьте почту и папку «Спам» — ссылка действует 1 час.
        </p>
        <Link href="/login" className="inline-block text-sm font-medium text-wheat-700 hover:underline">
          ← Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-700" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
          placeholder="you@example.com"
        />
      </div>
      <button type="submit" disabled={busy} className={authPrimaryBtn}>
        {busy ? "Отправляем…" : "Отправить ссылку"}
      </button>
      <p className="text-center text-sm text-forest-600">
        Вспомнили?{" "}
        <Link href="/login" className="font-medium text-wheat-700 hover:underline">Войти</Link>
      </p>
    </form>
  );
}
