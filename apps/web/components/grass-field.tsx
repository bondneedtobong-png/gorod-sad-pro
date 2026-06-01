"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Задача 1 — «прорастание травы».
 *
 * Полоса SVG-травинок в низу hero: при первой загрузке травинки прорастают
 * снизу вверх (один раз за сессию), затем мягко колышутся на ветру.
 *
 * Техника:
 *  - рост      — scaleY(0→1) от базовой линии (transform-box: fill-box);
 *  - колыхание — rotate с разбросом фаз/длительностей, чтобы не было синхрона;
 *  - всё на transform (GPU), без layout-thrashing.
 *
 * Геометрия травинок генерируется детерминированно (seeded RNG), поэтому
 * совпадает на сервере и клиенте — без hydration-расхождений.
 * Уважает prefers-reduced-motion: трава сразу в финальном виде, без анимаций.
 */

const VIEW_W = 1200;
const BASE_Y = 220;

// Чтобы «рост» проигрывался один раз за сессию (модульный флаг — без storage).
let grassHasGrown = false;

interface Blade {
  d: string;
  dayColor: string;
  nightColor: string;
  dayOpacity: number;
  nightOpacity: number;
  amp: number; // амплитуда колыхания, градусы
  swayDur: number;
  swayDelay: number;
  growDur: number;
  growDelay: number;
}

interface Spore {
  cx: number;
  cy: number;
  r: number;
  dur: number;
  delay: number;
  drift: number;
}

/** Простой детерминированный PRNG (mulberry32). */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bladePath(x: number, h: number, w: number, lean: number): string {
  const tipX = x + lean;
  const tipY = BASE_Y - h;
  const cLx = x - w * 0.18 + lean * 0.4;
  const cRx = x + w * 0.18 + lean * 0.4;
  const cY = BASE_Y - h * 0.55;
  return `M${(x - w / 2).toFixed(1)} ${BASE_Y} Q${cLx.toFixed(1)} ${cY.toFixed(1)} ${tipX.toFixed(1)} ${tipY.toFixed(1)} Q${cRx.toFixed(1)} ${cY.toFixed(1)} ${(x + w / 2).toFixed(1)} ${BASE_Y} Z`;
}

interface LayerCfg {
  count: number;
  hMin: number;
  hMax: number;
  wMin: number;
  wMax: number;
  lean: number;
  ampMin: number;
  ampMax: number;
  day: string;
  night: string;
  dayOpacity: number;
  nightOpacity: number;
  /** доля травинок с тёплым (wheat) оттенком — «сухие» стебельки */
  wheatRatio: number;
}

const LAYERS: LayerCfg[] = [
  // дальний план — мельче, бледнее, холоднее
  { count: 30, hMin: 26, hMax: 48, wMin: 7, wMax: 11, lean: 6, ampMin: 1, ampMax: 2, day: "#274730", night: "#101F14", dayOpacity: 0.55, nightOpacity: 0.65, wheatRatio: 0 },
  // средний план
  { count: 26, hMin: 44, hMax: 74, wMin: 9, wMax: 14, lean: 9, ampMin: 1.6, ampMax: 2.8, day: "#3A6240", night: "#1A3020", dayOpacity: 0.85, nightOpacity: 0.85, wheatRatio: 0.1 },
  // передний план — выше, сочнее, с тёплыми акцентами
  { count: 22, hMin: 70, hMax: 112, wMin: 11, wMax: 18, lean: 13, ampMin: 2.4, ampMax: 3.8, day: "#5F8466", night: "#274730", dayOpacity: 1, nightOpacity: 0.95, wheatRatio: 0.18 },
];

/** Генерируем травинки один раз (детерминированно). */
function buildBlades(): Blade[] {
  const rnd = mulberry32(20120512); // «с 2012 года» :)
  const blades: Blade[] = [];

  LAYERS.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      // равномерно по ширине с джиттером
      const x = ((i + 0.5) / layer.count) * VIEW_W + (rnd() - 0.5) * (VIEW_W / layer.count) * 0.9;
      const h = layer.hMin + rnd() * (layer.hMax - layer.hMin);
      const w = layer.wMin + rnd() * (layer.wMax - layer.wMin);
      const lean = (rnd() - 0.5) * 2 * layer.lean;
      const isWheat = rnd() < layer.wheatRatio;

      blades.push({
        d: bladePath(x, h, w, lean),
        dayColor: isWheat ? "#D9C77A" : layer.day,
        nightColor: isWheat ? "#7E7448" : layer.night,
        dayOpacity: isWheat ? 0.9 : layer.dayOpacity,
        nightOpacity: isWheat ? 0.7 : layer.nightOpacity,
        amp: layer.ampMin + rnd() * (layer.ampMax - layer.ampMin),
        swayDur: 3.2 + rnd() * 2.8,
        swayDelay: -rnd() * 6,
        // лёгкий разброс старта роста слева-направо + джиттер (итог ≤ ~1.7с)
        growDur: 0.9 + rnd() * 0.35,
        growDelay: (x / VIEW_W) * 0.35 + rnd() * 0.2,
      });
    }
  });

  return blades;
}

const BLADES = buildBlades();

const SPORES: Spore[] = [
  { cx: 240, cy: 70, r: 2.4, dur: 16, delay: 0, drift: 40 },
  { cx: 820, cy: 110, r: 1.8, dur: 21, delay: 4, drift: -34 },
];

interface GrassFieldProps {
  className?: string;
  /** Ночной режим — трава темнее (используется сценой День/Ночь). */
  night?: boolean;
  /** Высота полосы (CSS). По умолчанию адаптивная через класс. */
}

export function GrassField({ className, night = false }: GrassFieldProps) {
  const reduced = usePrefersReducedMotion();
  const [growing, setGrowing] = useState(false);

  useEffect(() => {
    // Синхронно читаем reduce, чтобы reduce-пользователь не увидел рост.
    const reduceNow =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceNow || grassHasGrown) return;

    setGrowing(true);
    grassHasGrown = true;
    const t = setTimeout(() => setGrowing(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "grass-field pointer-events-none select-none",
        growing && "is-growing",
        reduced && "reduce",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${BASE_Y}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="grass-ground" x1="0" y1="1" x2="0" y2="0">
            <stop
              offset="0%"
              stopColor={night ? "#0C1810" : "#DEE9C2"}
              stopOpacity={night ? 0.85 : 0.95}
            />
            <stop
              offset="100%"
              stopColor={night ? "#0C1810" : "#DEE9C2"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* мягкое «основание» под травой */}
        <rect x="0" y={BASE_Y - 46} width={VIEW_W} height="46" fill="url(#grass-ground)" />

        {/* дрейфующие споры/пыльца — очень сдержанно */}
        {!reduced &&
          SPORES.map((s, i) => (
            <circle
              key={`spore-${i}`}
              className="grass-spore"
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={night ? "#E5D998" : "#EDE4B5"}
              opacity={night ? 0.5 : 0.35}
              style={
                {
                  "--spore-dur": `${s.dur}s`,
                  "--spore-delay": `${s.delay}s`,
                  "--spore-drift": `${s.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}

        {/* травинки */}
        {BLADES.map((b, i) => (
          <g
            key={i}
            className="blade-grow"
            style={
              {
                "--grow-dur": `${b.growDur}s`,
                "--grow-delay": `${b.growDelay}s`,
              } as React.CSSProperties
            }
          >
            <g
              className="blade-sway"
              style={
                {
                  "--amp": `${b.amp}deg`,
                  "--sway-dur": `${b.swayDur}s`,
                  "--sway-delay": `${b.swayDelay}s`,
                } as React.CSSProperties
              }
            >
              <path
                d={b.d}
                fill={night ? b.nightColor : b.dayColor}
                opacity={night ? b.nightOpacity : b.dayOpacity}
                style={{ transition: "fill 700ms ease, opacity 700ms ease" }}
              />
            </g>
          </g>
        ))}
      </svg>

      <style jsx>{`
        .grass-field {
          width: 100%;
          height: 140px;
        }
        @media (min-width: 1024px) {
          .grass-field {
            height: 190px;
          }
        }
        :global(.blade-grow) {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          transform: scaleY(1);
        }
        :global(.blade-sway) {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: grass-sway var(--sway-dur, 4s) ease-in-out infinite;
          animation-delay: var(--sway-delay, 0s);
          will-change: transform;
        }
        /* во время первой загрузки — рост снизу вверх */
        .is-growing :global(.blade-grow) {
          transform: scaleY(0);
          animation: grass-grow var(--grow-dur, 1s) ease-out forwards;
          animation-delay: var(--grow-delay, 0s);
        }
        :global(.grass-spore) {
          animation: grass-spore-float var(--spore-dur, 18s) ease-in-out infinite;
          animation-delay: var(--spore-delay, 0s);
          will-change: transform, opacity;
        }
        /* reduce: всё статично, трава сразу в финале */
        .reduce :global(.blade-grow),
        .reduce :global(.blade-sway),
        .reduce :global(.grass-spore) {
          animation: none !important;
          transform: none !important;
        }
        @keyframes grass-grow {
          from {
            transform: scaleY(0);
          }
          to {
            transform: scaleY(1);
          }
        }
        @keyframes grass-sway {
          0%,
          100% {
            transform: rotate(calc(var(--amp, 3deg) * -1));
          }
          50% {
            transform: rotate(var(--amp, 3deg));
          }
        }
        @keyframes grass-spore-float {
          0% {
            transform: translate(0, 0);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translate(var(--spore-drift, 30px), -90px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
