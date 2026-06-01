"use client";

import { useEffect, useState } from "react";

/**
 * Возвращает true, если пользователь просит уменьшить движение
 * (`prefers-reduced-motion: reduce`).
 *
 * SSR-безопасно: на сервере и до монтирования возвращает false, затем
 * обновляется на клиенте. Все декоративные анимации в проекте обязаны
 * уважать этот флаг — при reduce контент сразу в финальном состоянии.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
