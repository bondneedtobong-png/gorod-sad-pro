"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Ambient-частицы поверх сцены (Canvas 2D).
 *  - day   → медленная пыльца/листья (тёплые + зелёные);
 *  - night → светлячки с мягким свечением и «дыханием».
 *
 * Производительность:
 *  - пауза, когда секция вне вьюпорта (IntersectionObserver);
 *  - плотность зависит от площади и снижается на тач-устройствах;
 *  - prefers-reduced-motion → один статичный кадр, без rAF.
 */

interface Props {
  mode?: "day" | "night";
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  tw: number;
  twSpeed: number;
  color: string;
}

const DAY_COLORS = ["#A6F7EC", "#67F0DD", "#16A085", "#EAF5F0"];
const NIGHT_COLOR = "#67F0DD";

export function AmbientParticles({ mode = "day", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const night = mode === "night";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const coarse = window.matchMedia("(pointer:coarse)").matches;
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];

    function spawn(anywhere: boolean): Particle {
      const color = night
        ? NIGHT_COLOR
        : DAY_COLORS[Math.floor(Math.random() * DAY_COLORS.length)];
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: night ? 1.2 + Math.random() * 1.8 : 1.4 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * (night ? 6 : 9),
        vy: night ? (Math.random() - 0.5) * 6 : -(4 + Math.random() * 11),
        a: night ? 0.5 + Math.random() * 0.4 : 0.22 + Math.random() * 0.32,
        tw: Math.random() * Math.PI * 2,
        twSpeed: night ? 1.1 + Math.random() * 1.7 : 0.3 + Math.random() * 0.5,
        color,
      };
    }

    function initParticles() {
      const density = coarse ? 44000 : 30000;
      let count = Math.round((w * h) / density);
      count = Math.max(7, Math.min(night ? 24 : 18, count));
      particles = Array.from({ length: count }, () => spawn(true));
    }

    function resize() {
      const rect = parent!.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function update(dt: number, t: number) {
      for (const p of particles) {
        if (night) {
          p.x += p.vx * dt + Math.sin(t * 0.5 + p.tw) * 0.15;
          p.y += p.vy * dt + Math.cos(t * 0.4 + p.tw) * 0.15;
          if (p.x < -10) p.x = w + 10;
          else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          else if (p.y > h + 10) p.y = -10;
        } else {
          p.x += p.vx * dt + Math.sin(t * 0.3 + p.tw) * 0.2;
          p.y += p.vy * dt;
          if (p.y < -12) {
            p.y = h + 12;
            p.x = Math.random() * w;
          }
          if (p.x < -12) p.x = w + 12;
          else if (p.x > w + 12) p.x = -12;
        }
      }
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        const twinkle = night ? 0.5 + 0.5 * Math.sin(t * p.twSpeed + p.tw) : 1;
        ctx!.globalAlpha = p.a * twinkle;
        ctx!.fillStyle = p.color;
        if (night) {
          ctx!.shadowColor = p.color;
          ctx!.shadowBlur = 9;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      ctx!.shadowBlur = 0;
    }

    resize();

    // reduced-motion: один статичный кадр, без анимации.
    if (reduced) {
      draw(0);
      const ro0 = new ResizeObserver(() => {
        resize();
        draw(0);
      });
      ro0.observe(parent);
      return () => ro0.disconnect();
    }

    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      update(dt, now / 1000);
      draw(now / 1000);
      raf = requestAnimationFrame(frame);
    };
    const startLoop = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stopLoop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Анимируем только пока секция видима.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 },
    );
    io.observe(parent);

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);

    return () => {
      stopLoop();
      io.disconnect();
      ro.disconnect();
    };
  }, [mode, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
