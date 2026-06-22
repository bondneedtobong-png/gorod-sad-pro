"use client";

import { useEffect, useState } from "react";

import { getSeason, SEASON_INFO } from "@/lib/utils";

/**
 * Sticky-бейдж сезона в углу. Лёгкая анимация листочка.
 * Локализуется к текущей дате на клиенте.
 */
export function SeasonBadge() {
  const [season, setSeason] = useState<keyof typeof SEASON_INFO | null>(null);

  useEffect(() => {
    setSeason(getSeason());
  }, []);

  if (!season) return null;
  const info = SEASON_INFO[season];

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-30 hidden lg:block">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/12 bg-pine-900/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-mist/70 shadow-card backdrop-blur-md">
        <span className="text-base leading-none" aria-hidden style={{ animation: "season-wiggle 6s ease-in-out infinite" }}>
          {info.emoji}
        </span>
        <span>
          Сейчас в саду:{" "}
          <span className="font-semibold text-aqua-400">{info.label}</span>
        </span>
      </div>
      <style jsx>{`
        @keyframes season-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
