"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { FlowerBedIcon, LampIcon, PathIcon, TreeIcon } from "@/components/garden-icons";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Задача 2 — слайдер сравнения «Было / Стало».
 *
 * Тянешь ручку (мышь / тач / клавиатура) — «после» раскрывается поверх «до»
 * через clip-path. Сейчас фото нет → красивые SVG-плейсхолдеры на брендовых
 * иконках. Реальные фото подставляются через props before/after (или
 * lib/media.ts → BEFORE_AFTER_CASES) без правок кода.
 *
 * prefers-reduced-motion: позиция по центру, без декоративных твинов
 * (drag и клавиши работают, но без «доводки»).
 */

interface Props {
  before?: string | null;
  after?: string | null;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  className?: string;
}

export function BeforeAfter({
  before = null,
  after = null,
  beforeLabel = "Было",
  afterLabel = "Стало",
  caption,
  className,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };
  const stop = () => setDragging(false);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 3;
    if (e.key === "ArrowLeft") {
      setPos((p) => Math.max(0, p - step));
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setPos((p) => Math.min(100, p + step));
      e.preventDefault();
    } else if (e.key === "Home") {
      setPos(0);
      e.preventDefault();
    } else if (e.key === "End") {
      setPos(100);
      e.preventDefault();
    }
  };

  const glide = dragging || reduced ? "none" : "clip-path 140ms ease-out, left 140ms ease-out";

  return (
    <div className={className}>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-3xl shadow-card ring-1 ring-forest-200/70"
      >
        {/* СЛОЙ «Стало» (фон) */}
        <div className="absolute inset-0">
          {after ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={after} alt={afterLabel} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <AfterScene />
          )}
        </div>

        {/* СЛОЙ «Было» (поверх, обрезается по ширине) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: glide }}
        >
          {before ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={before} alt={beforeLabel} className="h-full w-full object-cover" draggable={false} />
          ) : (
            <BeforeScene />
          )}
        </div>

        {/* подписи */}
        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cream/90 backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cream/90 backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* разделитель + ручка */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-wheat-400/90 shadow-[0_0_12px_rgba(217,199,122,0.6)]"
          style={{ left: `${pos}%`, transform: "translateX(-50%)", transition: glide }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Сравнение: было и стало"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-wheat-500 text-bark shadow-wheat-glow outline-none ring-2 ring-cream/40 focus-visible:ring-4 focus-visible:ring-cream/70"
          >
            <div className="flex items-center">
              <ChevronLeft className="h-4 w-4 -mr-1" strokeWidth={2.4} />
              <ChevronRight className="h-4 w-4 -ml-1" strokeWidth={2.4} />
            </div>
          </div>
        </div>
      </div>

      {caption && <p className="mt-3 text-center text-sm text-cream/55">{caption}</p>}
    </div>
  );
}

/* ───────── Плейсхолдеры (пока нет реальных фото) ───────── */

function DemoTag() {
  return (
    <span className="absolute bottom-3 right-3 rounded bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cream/70">
      демо
    </span>
  );
}

/** «Было» — голый, неухоженный участок. */
function BeforeScene() {
  return (
    <div
      className="relative h-full w-full"
      style={{ background: "linear-gradient(160deg, #6b5a40 0%, #4d3f2b 60%, #392f20 100%)" }}
    >
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {/* борозды/сухая земля */}
        <path d="M0 175 Q 100 165 200 175 T 400 172 L400 250 L0 250 Z" fill="#3a3020" opacity="0.6" />
        <path d="M0 205 Q 120 198 240 206 T 400 202 L400 250 L0 250 Z" fill="#2e2618" opacity="0.7" />
        {/* камни */}
        <ellipse cx="80" cy="200" rx="20" ry="9" fill="#5b5142" />
        <ellipse cx="300" cy="216" rx="26" ry="11" fill="#4a4233" />
        <ellipse cx="190" cy="225" rx="14" ry="6" fill="#5b5142" />
        {/* сухие сорняки */}
        {[60, 130, 250, 330].map((x, i) => (
          <g key={i} stroke="#7c6b48" strokeWidth="2" strokeLinecap="round" opacity="0.7">
            <line x1={x} y1="190" x2={x - 6} y2="168" />
            <line x1={x} y1="190" x2={x + 5} y2="170" />
            <line x1={x} y1="190" x2={x} y2="162" />
          </g>
        ))}
      </svg>
      <DemoTag />
    </div>
  );
}

/** «Стало» — ухоженный сад (брендовые иконки). */
function AfterScene() {
  return (
    <div
      className="relative h-full w-full"
      style={{ background: "linear-gradient(160deg, #7BA890 0%, #3A6240 58%, #274730 100%)" }}
    >
      {/* дорожка */}
      <div className="absolute bottom-0 left-1/2 h-[38%] w-[26%] -translate-x-1/2 overflow-hidden rounded-t-[40%] opacity-90">
        <PathIcon className="h-full w-full" />
      </div>
      {/* дерево */}
      <TreeIcon season="summer" className="absolute bottom-[12%] left-[10%] h-32 w-32 drop-shadow-lg" />
      {/* клумба */}
      <FlowerBedIcon season="summer" className="absolute bottom-[6%] right-[12%] h-24 w-24" />
      {/* фонарь */}
      <LampIcon className="absolute bottom-[10%] left-[46%] h-20 w-20 opacity-90" />
      <DemoTag />
    </div>
  );
}
