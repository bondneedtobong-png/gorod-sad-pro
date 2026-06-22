"use client";

import { useEffect, useRef } from "react";

/**
 * Тонкий бирюзовый блик за курсором. Только на устройствах с pointer:fine.
 * Минимум перерасхода — позиционируется через transform без ререндеров.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer:fine)").matches) return;

    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${e.clientX - 200}px, ${e.clientY - 200}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 -z-10 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
      style={{
        background:
          "radial-gradient(circle, rgba(46, 230, 205, 0.30) 0%, rgba(46, 230, 205, 0.08) 30%, transparent 70%)",
      }}
    />
  );
}
