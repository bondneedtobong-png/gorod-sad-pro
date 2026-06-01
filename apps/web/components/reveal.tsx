"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Задержка появления в мс */
  delay?: number;
  /** Дополнительный класс */
  className?: string;
  /** Сдвиг по Y перед появлением (по умолчанию 24px) */
  y?: number;
}

/**
 * Простая обёртка для появления элемента при попадании во вьюпорт.
 * Не требует Framer Motion — IntersectionObserver + CSS transitions.
 */
export function Reveal({ children, delay = 0, className, y = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        opacity: visible ? 1 : 0,
        transition: "opacity 600ms ease-out, transform 600ms ease-out",
        transitionDelay: `${delay}ms`,
      }}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
