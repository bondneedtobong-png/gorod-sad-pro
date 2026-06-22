"use client";

import { Calculator as CalcIcon, Phone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { estimate, formatRub, type EstimateResponse, type Service } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  service: Service;
}

export function Calculator({ service }: Props) {
  const isPerUnit = service.rate_per_m2 === 0;
  const [area, setArea] = useState(isPerUnit ? 1 : 100);
  const [fullCycle, setFullCycle] = useState(false);
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      const r = await estimate({
        service: service.slug,
        area_m2: area,
        full_cycle: fullCycle,
      });
      if (!cancelled) {
        setResult(r);
        setBusy(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [service.slug, area, fullCycle]);

  const max = isPerUnit ? 30 : 2000;
  const min = isPerUnit ? 1 : 10;

  return (
    <div className="rounded-3xl bg-white/[0.04] p-6 shadow-card ring-1 ring-white/10 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-aqua-400/15 ring-1 ring-aqua-400/30">
          <CalcIcon className="h-5 w-5 text-aqua-400" />
        </div>
        <div>
          <div className="font-display text-2xl text-mist">Калькулятор стоимости</div>
          <div className="text-xs uppercase tracking-[0.18em] text-mist/50">
            предварительная оценка · уточняется на выезде
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-baseline justify-between">
          <label className="text-sm text-mist/70">
            {isPerUnit ? "Количество фигур" : "Площадь"}
          </label>
          <div className="font-display text-3xl text-mist">
            {area}{" "}
            <span className="text-base text-mist/50">{isPerUnit ? "шт" : "м²"}</span>
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={isPerUnit ? 1 : 10}
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          aria-label={isPerUnit ? "Количество фигур" : "Площадь, м²"}
          className="slider w-full accent-aqua-400"
        />
        <div className="flex justify-between text-xs text-mist/50">
          <span>{min}</span>
          <span>{Math.round(max / 2)}</span>
          <span>{max}</span>
        </div>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={() => setFullCycle((v) => !v)}
          className={cn(
            "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
            fullCycle
              ? "border-aqua-400/60 bg-aqua-400/12"
              : "border-white/12 bg-white/5 hover:border-white/25",
          )}
        >
          <div
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition",
              fullCycle ? "border-aqua-400 bg-aqua-400 text-pine-950" : "border-white/25",
            )}
          >
            {fullCycle && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M13.5 4L6 11.5 2.5 8" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className={cn("font-medium", fullCycle ? "text-aqua-400" : "text-mist")}>
              Комплекс работ
            </div>
            <div className="mt-0.5 text-xs text-mist/60">
              При заказе нескольких услуг сразу вычитаем 30% из сметы проектирования
            </div>
          </div>
          {fullCycle && <div className="font-display text-2xl text-aqua-400">−30%</div>}
        </button>
      </div>

      <div className="mb-4 rounded-2xl bg-aqua-400/12 p-5 ring-1 ring-aqua-400/30">
        <div className="text-xs uppercase tracking-[0.18em] text-aqua-400">
          ориентировочная стоимость
        </div>
        <div className={cn("mt-1 font-display text-5xl text-mist transition-opacity", busy && "opacity-50")}>
          {result ? formatRub(result.total_rub) : "—"}
        </div>
        {result && (
          <div className="mt-3 space-y-1 text-sm text-mist/60">
            <div className="flex justify-between">
              <span>Базовая стоимость</span>
              <span>{formatRub(result.base_rub)}</span>
            </div>
            {result.discount_rub > 0 && (
              <div className="flex justify-between text-aqua-400">
                <span>Скидка комплекс</span>
                <span>−{formatRub(result.discount_rub)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="tel:+79370388344"
          className="inline-flex items-center gap-2 rounded-full bg-gs-fresh px-5 py-3 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110"
        >
          <Phone className="h-4 w-4" /> Обсудить расчёт
        </a>
        <a
          href="/sandbox"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-mist transition hover:border-aqua-400 hover:text-aqua-400"
        >
          <Sparkles className="h-4 w-4" /> Спроектировать свой сад
        </a>
      </div>

      <p className="mt-4 text-xs text-mist/50">{result?.note ?? ""}</p>

      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #0a4e3d;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2ee6cd;
          cursor: pointer;
          box-shadow: 0 0 14px rgba(46, 230, 205, 0.6);
        }
        .slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #2ee6cd;
          cursor: pointer;
          border: 0;
        }
      `}</style>
    </div>
  );
}
