"use client";

import Link from "next/link";
import { useState } from "react";

import { createDeal } from "@/app/account/actions";
import { cardClass, inputClass, labelClass, primaryBtn } from "@/lib/ui-classes";

export function LeadForm({
  serviceSlug,
  title,
  estimateRub,
  className,
}: {
  serviceSlug?: string;
  title?: string;
  estimateRub?: number;
  className?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Нужно согласие на обработку персональных данных");
      return;
    }
    setBusy(true);
    setError("");
    const res = await createDeal({
      serviceSlug,
      title,
      message,
      contactName: name,
      contactPhone: phone,
      estimateRub,
      consent: true,
    });
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error);
  }

  if (done) {
    return (
      <div className={`${cardClass} ${className ?? ""}`}>
        <div className="font-display text-2xl text-mist">Спасибо, заявка принята! 🌿</div>
        <p className="mt-2 text-mist/72">
          Алексей Юрьевич перезвонит в ближайшее время. Если вы вошли в аккаунт —
          заявка появилась в разделе «Мои заявки».
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${cardClass} space-y-4 ${className ?? ""}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="lead-name">Имя</label>
          <input id="lead-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Как к вам обращаться" />
        </div>
        <div>
          <label className={labelClass} htmlFor="lead-phone">Телефон</label>
          <input id="lead-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="+7 (___) ___-__-__" />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="lead-msg">Сообщение</label>
        <textarea id="lead-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} resize-none`} placeholder="Коротко об участке и пожеланиях" />
      </div>
      <label className="flex items-start gap-2.5 text-xs leading-relaxed text-mist/60">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-aqua-400" />
        <span>
          Я согласен на обработку персональных данных согласно{" "}
          <Link href="/privacy" className="text-aqua-400 hover:underline" target="_blank">политике конфиденциальности</Link>.
        </span>
      </label>
      {error && <p className="text-sm font-medium text-red-400">{error}</p>}
      <button type="submit" disabled={busy} className={primaryBtn}>
        {busy ? "Отправляем…" : "Оставить заявку"}
      </button>
    </form>
  );
}
