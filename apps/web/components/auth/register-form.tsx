"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { authInputClass, authPrimaryBtn } from "@/components/auth/auth-shell";

const labelClass = "mb-1.5 block text-sm font-medium text-mist/80";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const upd =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Нужно согласие на обработку персональных данных");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, consent: true }),
    });
    if (res.ok) {
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.push("/account");
      return;
    }
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 || data?.error === "email_taken") {
      setError("Этот email уже зарегистрирован");
    } else if (data?.error === "too_many") {
      setError("Слишком много попыток. Попробуйте позже.");
    } else {
      setError("Проверьте поля: имя, корректный email и пароль от 8 символов.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="name">Имя</label>
        <input id="name" required value={form.name} onChange={upd("name")} className={authInputClass} placeholder="Как к вам обращаться" />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" required value={form.email} onChange={upd("email")} className={authInputClass} placeholder="you@example.com" />
      </div>
      <div>
        <label className={labelClass} htmlFor="phone">Телефон</label>
        <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={upd("phone")} className={authInputClass} placeholder="+7 (___) ___-__-__" />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Пароль</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={upd("password")} className={authInputClass} placeholder="Минимум 8 символов" />
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-mist/60">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-aqua-400"
        />
        <span>
          Я согласен на обработку персональных данных в соответствии с{" "}
          <Link href="/privacy" className="text-aqua-400 hover:underline" target="_blank">
            политикой конфиденциальности
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className={authPrimaryBtn}>
        {busy ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-mist/60">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-aqua-400 hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
