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
    <div className="rounded-3xl bg-paper p-6 shadow-card ring-1 ring-forest-200/70 lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-wheat-500/15 ring-1 ring-wheat-500/30">
          <CalcIcon className="h-5 w-5 text-wheat-700" />
        </div>
        <div>
          <div className="font-display text-2xl text-forest-800">Калькулятор стоимости</div>
          <div className="text-xs uppercase tracking-[0.18em] text-forest-500">
            предварительная оценка · уточняется на выезде
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-baseline justify-between">
          <label className="text-sm text-forest-700">
            {isPerUnit ? "Количество фигур" : "Площадь"}
          </label>
          <div className="font-display text-3xl text-forest-900">
            {area}{" "}
            <span className="text-base text-forest-500">{isPerUnit ? "шт" : "м²"}</span>
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
          className="slider w-full accent-wheat-500"
        />
        <div className="flex justify-between text-xs text-forest-500">
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
              ? "border-wheat-500/70 bg-wheat-500/15"
              : "border-forest-200 bg-forest-50 hover:border-forest-300",
          )}
        >
          <div
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition",
              fullCycle ? "border-wheat-600 bg-wheat-500 text-forest-900" : "border-forest-300",
            )}
          >
            {fullCycle && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M13.5 4L6 11.5 2.5 8" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className={cn("font-medium", fullCycle ? "text-wheat-700" : "text-forest-800")}>
              Комплекс работ
            </div>
            <div className="mt-0.5 text-xs text-forest-600">
              При заказе нескольких услуг сразу вычитаем 30% из сметы проектирования
            </div>
          </div>
          {fullCycle && <div className="font-display text-2xl text-wheat-700">−30%</div>}
        </button>
      </div>

      <div className="mb-4 rounded-2xl bg-wheat-500/15 p-5 ring-1 ring-wheat-500/40">
        <div className="text-xs uppercase tracking-[0.18em] text-wheat-700">
          ориентировочная стоимость
        </div>
        <div className={cn("mt-1 font-display text-5xl text-forest-900 transition-opacity", busy && "opacity-50")}>
          {result ? formatRub(result.total_rub) : "—"}
        </div>
        {result && (
          <div className="mt-3 space-y-1 text-sm text-forest-600">
            <div className="flex justify-between">
              <span>Базовая стоимость</span>
              <span>{formatRub(result.base_rub)}</span>
            </div>
            {result.discount_rub > 0 && (
              <div className="flex justify-between text-wheat-700">
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
          className="inline-flex items-center gap-2 rounded-full bg-wheat-500 px-5 py-3 text-sm font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
        >
          <Phone className="h-4 w-4" /> Обсудить расчёт
        </a>
        <a
          href="/sandbox"
          className="inline-flex items-center gap-2 rounded-full border border-forest-300 px-5 py-3 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
        >
          <Sparkles className="h-4 w-4" /> Спроектировать свой сад
        </a>
      </div>

      <p className="mt-4 text-xs text-forest-500">{result?.note ?? ""}</p>

      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #d8e4da;
          outline: none;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #d9c77a;
          cursor: pointer;
          box-shadow: 0 0 14px rgba(217, 199, 122, 0.6);
        }
        .slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #d9c77a;
          cursor: pointer;
          border: 0;
        }
      `}</style>
    </div>
  );
}
