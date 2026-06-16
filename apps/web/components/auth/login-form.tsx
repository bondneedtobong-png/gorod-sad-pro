"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import { authInputClass, authPrimaryBtn } from "@/components/auth/auth-shell";

const labelClass = "mb-1.5 block text-sm font-medium text-forest-700";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasVk, setHasVk] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((p) => setHasVk(Boolean(p?.vk)))
      .catch(() => undefined);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (res?.error) setError("Неверный email или пароль");
    else router.push(callbackUrl);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
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
        <div>
          <label className={labelClass} htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder="••••••••"
          />
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs text-forest-600 transition hover:text-wheat-700 hover:underline">
              Забыли пароль?
            </Link>
          </div>
        </div>
        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className={authPrimaryBtn}>
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>

      {hasVk && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-forest-500">
            <span className="h-px flex-1 bg-forest-200" /> или <span className="h-px flex-1 bg-forest-200" />
          </div>
          <button
            type="button"
            onClick={() => signIn("vk", { callbackUrl })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-forest-300 px-5 py-3 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
          >
            Войти через VK
          </button>
        </>
      )}

      <p className="mt-6 text-center text-sm text-forest-600">
        Нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-wheat-700 hover:underline">
          Регистрация
        </Link>
      </p>
    </div>
  );
}
