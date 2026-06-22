"use client";

import { ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AmbientParticles } from "@/components/ambient-particles";
import { GrassField } from "@/components/grass-field";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Задача 3 — атмосферный тумблер «День / Ночь».
 *
 * Демонстрационная сцена, завязанная на услугу «Ландшафтное освещение»:
 * при переключении в «Ночь» фон темнеет, загораются садовые фонари (тёплое
 * свечение с лёгким «дыханием»), проступают звёзды и светлячки, трава темнеет.
 *
 * Состояние — в React-стейте на сессию (без localStorage). По умолчанию — день.
 * prefers-reduced-motion: переключение мгновенное, без мерцаний и «дыхания».
 */

const LAMPS = [16, 39, 62, 85]; // позиции фонарей по горизонтали, %
const STARS = [
  { top: 12, left: 18, s: 2 },
  { top: 20, left: 32, s: 1.5 },
  { top: 9, left: 47, s: 2.5 },
  { top: 24, left: 58, s: 1.5 },
  { top: 14, left: 70, s: 2 },
  { top: 28, left: 80, s: 1.5 },
  { top: 18, left: 88, s: 2 },
  { top: 33, left: 24, s: 1.5 },
  { top: 8, left: 63, s: 1.5 },
  { top: 30, left: 44, s: 2 },
];

export function DayNightScene() {
  const [night, setNight] = useState(false);
  const reduced = usePrefersReducedMotion();

  const t = reduced ? "" : "transition-all duration-700 ease-in-out";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl ring-1",
        night ? "ring-aqua-400/25" : "ring-white/10",
        "shadow-card",
        reduced ? "" : "transition-[box-shadow] duration-700",
      )}
      style={{ minHeight: 460 }}
    >
      {/* небо */}
      <div
        className={cn("absolute inset-0", t)}
        style={{
          background: night
            ? "linear-gradient(to bottom, #04121F 0%, #04221B 55%, #063D30 100%)"
            : "linear-gradient(to bottom, #16A085 0%, #0B6B4F 48%, #063D30 100%)",
        }}
      />

      {/* звёзды (видны ночью) */}
      <div
        className={cn("absolute inset-0", t)}
        style={{ opacity: night ? 1 : 0 }}
        aria-hidden
      >
        {STARS.map((st, i) => (
          <span
            key={i}
            className={cn("absolute rounded-full bg-mist", !reduced && "star-twinkle")}
            style={
              {
                top: `${st.top}%`,
                left: `${st.left}%`,
                width: st.s,
                height: st.s,
                "--tw-delay": `${(i % 5) * 0.6}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* солнце / луна */}
      <div className="pointer-events-none absolute right-10 top-8" aria-hidden>
        <div
          className={cn("absolute h-16 w-16 rounded-full", t)}
          style={{
            opacity: night ? 0 : 1,
            background: "radial-gradient(circle, #FDF3C4 0%, #E5D998 60%, rgba(217,199,122,0.2) 100%)",
            boxShadow: "0 0 60px 18px rgba(229,217,152,0.55)",
          }}
        />
        <div
          className={cn("absolute h-12 w-12 rounded-full", t)}
          style={{
            opacity: night ? 1 : 0,
            background: "radial-gradient(circle at 38% 38%, #F4EDD8 0%, #C9CEDA 70%, #8A93A6 100%)",
            boxShadow: "0 0 36px 8px rgba(201,206,218,0.35)",
          }}
        />
      </div>

      {/* светлячки/пыльца */}
      <AmbientParticles mode={night ? "night" : "day"} />

      {/* фонари */}
      {LAMPS.map((x, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${x}%`, bottom: 96, transform: "translateX(-50%)" }}
          aria-hidden
        >
          <div className="relative flex flex-col items-center">
            {/* ореол свечения */}
            <div
              className={cn("absolute left-1/2 top-1 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full", t, !reduced && night && "lamp-breathe")}
              style={
                {
                  opacity: night ? 1 : 0,
                  background:
                    "radial-gradient(circle, rgba(229,217,152,0.55) 0%, rgba(229,217,152,0.18) 40%, transparent 68%)",
                  "--lamp-delay": `${i * 0.5}s`,
                } as React.CSSProperties
              }
            />
            {/* плафон */}
            <div
              className={cn("relative z-10 h-3.5 w-3 rounded-[2px]", t)}
              style={{
                background: night ? "#FCE7A6" : "#5A6B4E",
                boxShadow: night ? "0 0 16px 4px rgba(252,231,166,0.85)" : "none",
              }}
            />
            {/* стойка */}
            <div className="h-20 w-[3px] bg-pine-950/80" />
            <div className="h-1.5 w-5 rounded-sm bg-pine-950/80" />
          </div>
        </div>
      ))}

      {/* трава (темнеет ночью) */}
      <GrassField night={night} className="absolute inset-x-0 bottom-0" />

      {/* затемняющий скрим под контентом */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/45 to-transparent" />

      {/* тумблер День/Ночь */}
      <button
        type="button"
        onClick={() => setNight((v) => !v)}
        aria-pressed={night}
        aria-label={night ? "Включить день" : "Включить ночь"}
        className="group absolute left-6 top-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-2 py-2 backdrop-blur-md transition hover:border-aqua-400/60"
      >
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition",
            !night ? "bg-aqua-400 text-pine-950" : "text-mist/60",
          )}
        >
          <Sun className="h-4 w-4" />
        </span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition",
            night ? "bg-mist text-pine-950" : "text-mist/60",
          )}
        >
          <Moon className="h-4 w-4" />
        </span>
      </button>

      {/* контент + связь с услугой освещения */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-6 lg:p-8">
        <div className="text-xs uppercase tracking-[0.22em] text-aqua-400">
          · Ландшафтное освещение
        </div>
        <h3 className="mt-1 max-w-lg font-display text-2xl font-semibold text-mist lg:text-3xl">
          {night ? "Сад продолжается и после заката" : "Нажмите луну — и сад оживёт ночью"}
        </h3>
        <Link
          href="/services/lighting"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gs-fresh px-5 py-2.5 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110"
        >
          Подробнее об освещении <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <style jsx>{`
        .star-twinkle {
          animation: dn-twinkle 3.4s ease-in-out infinite;
          animation-delay: var(--tw-delay, 0s);
        }
        .lamp-breathe {
          animation: dn-breathe 4s ease-in-out infinite;
          animation-delay: var(--lamp-delay, 0s);
        }
        @keyframes dn-twinkle {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes dn-breathe {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
