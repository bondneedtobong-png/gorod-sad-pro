"use client";

import {
  Check,
  ChevronRight,
  Download,
  Phone,
  Redo2,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  BenchIcon,
  BushIcon,
  ConiferIcon,
  EraserIcon,
  FlowerBedIcon,
  FountainIcon,
  LampIcon,
  LawnIcon,
  PathIcon,
  TreeIcon,
  WaterIcon,
} from "@/components/garden-icons";
import { formatRub } from "@/lib/api";
import {
  calculatePricing,
  ELEMENT_LABELS,
  ELEMENT_PRICES,
  LAND_CONDITION_OPTIONS,
  type ElementCounts,
  type ElementKey,
  type GroundKey,
  type LandCondition,
  type ObjectKey,
  type PlotConfig,
} from "@/lib/garden-pricing";
import { cn } from "@/lib/utils";

type Season = "spring" | "summer" | "autumn" | "winter";

interface Cell {
  ground: GroundKey | null;
  object: ObjectKey | null;
}

interface SnapshotState {
  cells: Cell[];
}

interface PaletteItem {
  id: ElementKey | "eraser";
  name: string;
  type: "ground" | "object" | "eraser";
  value: ElementKey | "eraser";
  Icon: React.ComponentType<{ className?: string; season?: Season }>;
}

const PALETTE: PaletteItem[] = [
  { id: "lawn",      name: "Газон",      type: "ground", value: "lawn",      Icon: LawnIcon },
  { id: "path",      name: "Плитка",     type: "ground", value: "path",      Icon: PathIcon },
  { id: "water",     name: "Водоём",     type: "ground", value: "water",     Icon: WaterIcon },
  { id: "tree",      name: "Дерево",     type: "object", value: "tree",      Icon: TreeIcon },
  { id: "conifer",   name: "Хвойное",    type: "object", value: "conifer",   Icon: ConiferIcon },
  { id: "bush",      name: "Куст",       type: "object", value: "bush",      Icon: BushIcon },
  { id: "flowerbed", name: "Клумба",     type: "object", value: "flowerbed", Icon: FlowerBedIcon },
  { id: "lamp",      name: "Фонарь",     type: "object", value: "lamp",      Icon: LampIcon },
  { id: "bench",     name: "Скамейка",   type: "object", value: "bench",     Icon: BenchIcon },
  { id: "fountain",  name: "Фонтан",     type: "object", value: "fountain",  Icon: FountainIcon },
  { id: "eraser",    name: "Ластик",     type: "eraser", value: "eraser",    Icon: EraserIcon },
];

const SEASONS: { key: Season; label: string; emoji: string }[] = [
  { key: "spring", label: "Весна", emoji: "🌱" },
  { key: "summer", label: "Лето",  emoji: "☀️" },
  { key: "autumn", label: "Осень", emoji: "🍂" },
  { key: "winter", label: "Зима",  emoji: "❄️" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
const STORAGE_KEY = "gorod-sad-sandbox-v2";
const HISTORY_LIMIT = 50;

function emptyCells(n: number): Cell[] {
  return Array.from({ length: n }, () => ({ ground: null, object: null }));
}

function countCells(cells: Cell[]): ElementCounts {
  const out: ElementCounts = {};
  for (const c of cells) {
    if (c.ground) out[c.ground] = (out[c.ground] ?? 0) + 1;
    if (c.object) out[c.object] = (out[c.object] ?? 0) + 1;
  }
  return out;
}

interface SavedState {
  config: PlotConfig;
  cells: Cell[];
  season: Season;
  fullCycle: boolean;
  savedAt: number;
}

// ============================================================
// MAIN
// ============================================================

export function GardenSandbox() {
  const [config, setConfig] = useState<PlotConfig | null>(null);
  const [setupOpen, setSetupOpen] = useState(true);
  const [history, setHistory] = useState<SnapshotState[]>([{ cells: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selected, setSelected] = useState<PaletteItem>(PALETTE[0]);
  const [season, setSeason] = useState<Season>("summer");
  const [fullCycle, setFullCycle] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState<SavedState | null>(null);

  const cells = history[historyIndex].cells;
  const pendingDragRef = useRef<Cell[] | null>(null);
  const draggingRef = useRef(false);

  // --- Восстановление из localStorage при первом монтировании ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedState;
      if (saved && saved.config && Array.isArray(saved.cells)) {
        setSavedNotice(saved);
      }
    } catch {}
  }, []);

  // --- Сохранение в localStorage при каждом изменении ---
  useEffect(() => {
    if (typeof window === "undefined" || !config) return;
    const data: SavedState = {
      config,
      cells,
      season,
      fullCycle,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [config, cells, season, fullCycle]);

  // --- Apply selected element at cell index ---
  const apply = useCallback(
    (cells: Cell[], idx: number, sel: PaletteItem): Cell[] => {
      const next = cells.slice();
      const cur = next[idx];
      if (!cur) return cells;
      const updated: Cell = { ...cur };
      if (sel.type === "eraser") {
        updated.ground = null;
        updated.object = null;
      } else if (sel.type === "ground") {
        updated.ground = sel.value as GroundKey;
      } else if (sel.type === "object") {
        updated.object = sel.value as ObjectKey;
      }
      next[idx] = updated;
      return next;
    },
    [],
  );

  // --- Drag-paint ---
  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    pendingDragRef.current = apply(cells, idx, selected);
  };
  const handlePointerEnter = (idx: number) => {
    if (!draggingRef.current) return;
    const base = pendingDragRef.current ?? cells;
    pendingDragRef.current = apply(base, idx, selected);
    // Live preview без записи в history
    setHistory((h) => {
      const copy = h.slice();
      copy[historyIndex] = { cells: pendingDragRef.current as Cell[] };
      return copy;
    });
  };

  // Commit history on pointerup
  useEffect(() => {
    const stop = () => {
      if (draggingRef.current && pendingDragRef.current) {
        const finalCells = pendingDragRef.current;
        draggingRef.current = false;
        pendingDragRef.current = null;
        setHistory((h) => {
          const trimmed = h.slice(0, historyIndex + 1);
          trimmed.push({ cells: finalCells });
          if (trimmed.length > HISTORY_LIMIT) trimmed.shift();
          return trimmed;
        });
        setHistoryIndex((i) => Math.min(i + 1, HISTORY_LIMIT - 1));
      }
      draggingRef.current = false;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
  };
  const redo = () => {
    if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
  };

  // Keyboard Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "z" || e.key === "я") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "y" || e.key === "н") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history.length]);

  // --- Setup: создаём план ---
  const startNewPlan = (cfg: PlotConfig) => {
    setConfig(cfg);
    setHistory([{ cells: emptyCells(cfg.width * cfg.height) }]);
    setHistoryIndex(0);
    setSetupOpen(false);
  };

  const restoreSaved = (saved: SavedState) => {
    setConfig(saved.config);
    setHistory([{ cells: saved.cells }]);
    setHistoryIndex(0);
    setSeason(saved.season);
    setFullCycle(saved.fullCycle);
    setSetupOpen(false);
    setSavedNotice(null);
  };

  const reset = () => {
    if (!config) return;
    if (!confirm("Очистить всё поле? Историю и сохранение это тоже сбросит.")) return;
    setHistory([{ cells: emptyCells(config.width * config.height) }]);
    setHistoryIndex(0);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  // --- Подсчёт стоимости ---
  const counts = useMemo(() => countCells(cells), [cells]);
  const pricing = useMemo(
    () =>
      config
        ? calculatePricing(config, counts, fullCycle)
        : null,
    [config, counts, fullCycle],
  );

  // --- Export SVG для отправки заявки ---
  const exportSvg = useCallback((): string => {
    if (!config) return "";
    const CELL = 40;
    const W = config.width * CELL;
    const H = config.height * CELL;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`;
    svg += `<rect width="${W}" height="${H}" fill="#2D4D2F"/>`;
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        const idx = y * config.width + x;
        const c = cells[idx];
        if (!c) continue;
        if (c.ground === "lawn") svg += `<rect x="${x * CELL}" y="${y * CELL}" width="${CELL}" height="${CELL}" fill="#5F8466"/>`;
        if (c.ground === "path") svg += `<rect x="${x * CELL}" y="${y * CELL}" width="${CELL}" height="${CELL}" fill="#A8A29E"/>`;
        if (c.ground === "water") svg += `<rect x="${x * CELL}" y="${y * CELL}" width="${CELL}" height="${CELL}" fill="#5BA3D0"/>`;
        if (c.object) {
          const cx = x * CELL + CELL / 2;
          const cy = y * CELL + CELL / 2;
          if (c.object === "tree") svg += `<circle cx="${cx}" cy="${cy - 4}" r="14" fill="#5F8466"/><rect x="${cx - 2}" y="${cy + 6}" width="4" height="10" fill="#3D2818"/>`;
          if (c.object === "conifer") svg += `<polygon points="${cx},${cy - 14} ${cx - 12},${cy + 10} ${cx + 12},${cy + 10}" fill="#274730"/>`;
          if (c.object === "bush") svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="#5F8466"/>`;
          if (c.object === "flowerbed") svg += `<rect x="${cx - 14}" y="${cy - 4}" width="28" height="10" fill="#D9C77A"/>`;
          if (c.object === "lamp") svg += `<circle cx="${cx}" cy="${cy - 6}" r="4" fill="#D9C77A"/><rect x="${cx - 1}" y="${cy - 6}" width="2" height="14" fill="#3D3D3D"/>`;
          if (c.object === "bench") svg += `<rect x="${cx - 14}" y="${cy - 2}" width="28" height="4" fill="#8B5A2B"/>`;
          if (c.object === "fountain") svg += `<circle cx="${cx}" cy="${cy}" r="15" fill="#5BA3D0"/><circle cx="${cx}" cy="${cy}" r="4" fill="#9FC5E8"/>`;
        }
      }
    }
    svg += "</svg>";
    return svg;
  }, [cells, config]);

  const downloadSvg = () => {
    const svg = exportSvg();
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gorod-sad-plan-${config?.width}x${config?.height}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================
  // RENDER — SETUP MODAL
  // ============================================================
  if (setupOpen || !config) {
    return (
      <div className="space-y-4">
        {savedNotice && (
          <div className="rounded-3xl border border-wheat-500/30 bg-wheat-500/10 p-4 lg:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-xl text-wheat-400">
                  Найден сохранённый план
                </div>
                <div className="text-xs text-cream/60">
                  {savedNotice.config.width}×{savedNotice.config.height} м,
                  сохранён{" "}
                  {new Date(savedNotice.savedAt).toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => restoreSaved(savedNotice)}
                  className="rounded-full bg-wheat-500 px-4 py-2 text-sm font-medium text-bark shadow-wheat-glow hover:bg-wheat-400"
                >
                  Восстановить
                </button>
                <button
                  type="button"
                  onClick={() => setSavedNotice(null)}
                  className="rounded-full border border-forest-600/40 px-4 py-2 text-sm text-cream/70 hover:text-cream"
                >
                  Начать с нуля
                </button>
              </div>
            </div>
          </div>
        )}
        <SetupForm onStart={startNewPlan} />
      </div>
    );
  }

  // ============================================================
  // RENDER — MAIN UI
  // ============================================================
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* === ЛЕВАЯ КОЛОНКА: сцена === */}
      <div className="space-y-4">
        {/* Тулбар */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSetupOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-forest-600/40 bg-forest-800/40 px-3 py-1.5 text-xs text-cream/70 transition hover:border-wheat-500/40 hover:text-wheat-400"
            >
              <Settings className="h-3 w-3" /> {config.width}×{config.height} м
              <ChevronRight className="h-3 w-3" />
            </button>
            <div className="flex gap-1">
              {SEASONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSeason(s.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] transition",
                    season === s.key
                      ? "border-wheat-400 bg-wheat-500/15 text-wheat-400"
                      : "border-forest-600/40 bg-forest-800/40 text-cream/60 hover:text-cream",
                  )}
                  title={s.label}
                >
                  <span>{s.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={historyIndex === 0}
              className="grid h-8 w-8 place-items-center rounded-full border border-forest-600/40 text-cream/70 transition hover:border-wheat-500/40 hover:text-wheat-400 disabled:cursor-not-allowed disabled:opacity-30"
              title="Отменить (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="grid h-8 w-8 place-items-center rounded-full border border-forest-600/40 text-cream/70 transition hover:border-wheat-500/40 hover:text-wheat-400 disabled:cursor-not-allowed disabled:opacity-30"
              title="Повторить (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={reset}
              className="grid h-8 w-8 place-items-center rounded-full border border-forest-600/40 text-cream/70 transition hover:border-copper hover:text-copper"
              title="Очистить"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Сцена (изометрия) */}
        <IsometricGrid
          width={config.width}
          height={config.height}
          cells={cells}
          season={season}
          onPointerDown={handlePointerDown}
          onPointerEnter={handlePointerEnter}
        />

        {/* Итог */}
        <div className="rounded-3xl bg-forest-800/60 p-4 ring-1 ring-forest-600/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-wheat-400">
                Итого проект
              </div>
              <div className="font-display text-4xl text-cream">
                {pricing ? formatRub(pricing.final_total) : "—"}
              </div>
              {pricing && pricing.full_cycle_discount > 0 && (
                <div className="mt-0.5 text-xs text-wheat-400">
                  Скидка −{formatRub(pricing.full_cycle_discount)}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadSvg}
                className="inline-flex items-center gap-1.5 rounded-full border border-wheat-500/40 px-4 py-2 text-sm text-cream transition hover:border-wheat-400 hover:text-wheat-400"
              >
                <Download className="h-3.5 w-3.5" /> SVG
              </button>
              <button
                type="button"
                onClick={() => setLeadOpen(true)}
                disabled={!pricing || pricing.grand_total === 0}
                className="inline-flex items-center gap-1.5 rounded-full bg-wheat-500 px-5 py-2 text-sm font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" /> Хочу такой сад
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === ПРАВАЯ КОЛОНКА: палитра + смета === */}
      <aside className="space-y-4">
        <div className="rounded-3xl bg-forest-800/60 p-4 ring-1 ring-forest-600/40">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-wheat-400">
            Элементы
          </div>
          <div className="grid grid-cols-3 gap-2">
            {PALETTE.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border p-2 transition",
                  selected.id === item.id
                    ? "border-wheat-400/70 bg-wheat-500/15 shadow-wheat-glow"
                    : "border-forest-600/40 bg-forest-900/40 hover:border-forest-500/60",
                )}
              >
                <div className="h-10 w-10">
                  <item.Icon className="h-full w-full" season={season} />
                </div>
                <div className="text-[10px] font-medium text-cream/80">{item.name}</div>
                <div className="text-[10px] text-cream/40">
                  {item.id === "eraser"
                    ? "—"
                    : formatRub(ELEMENT_PRICES[item.value as ElementKey])}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Комплекс */}
        <button
          type="button"
          onClick={() => setFullCycle((v) => !v)}
          className={cn(
            "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
            fullCycle
              ? "border-wheat-400/70 bg-wheat-500/15"
              : "border-forest-600/40 bg-forest-900/40 hover:border-forest-500/60",
          )}
        >
          <div
            className={cn(
              "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition",
              fullCycle ? "border-wheat-400 bg-wheat-500 text-bark" : "border-cream/40",
            )}
          >
            {fullCycle && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </div>
          <div className="flex-1">
            <div className={cn("text-sm font-medium", fullCycle ? "text-wheat-400" : "text-cream")}>
              Комплекс работ
            </div>
            <div className="mt-0.5 text-[11px] text-cream/60">
              При полном цикле — −30% от сметы проектирования
            </div>
          </div>
          {fullCycle && <span className="font-display text-xl text-wheat-400">−30%</span>}
        </button>

        {/* Смета */}
        {pricing && <PricingPanel pricing={pricing} />}
      </aside>

      {leadOpen && pricing && (
        <LeadDialog
          total={pricing.final_total}
          plan={exportSvg()}
          counts={counts}
          plotSize={`${config.width}×${config.height} м`}
          landConditions={config.conditions.map(
            (c) => LAND_CONDITION_OPTIONS.find((o) => o.key === c)?.label ?? c,
          )}
          onClose={() => setLeadOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// SETUP FORM — выбор размера и условий участка
// ============================================================

function SetupForm({ onStart }: { onStart: (cfg: PlotConfig) => void }) {
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(15);
  const [conditions, setConditions] = useState<Set<LandCondition>>(new Set(["clean"]));
  const [stumpsCount, setStumpsCount] = useState(2);

  const area = width * height;
  const tooLarge = area > 2500; // ограничение для производительности

  function toggleCond(c: LandCondition) {
    setConditions((cur) => {
      const next = new Set(cur);
      // "clean" взаимоисключающий с остальными
      if (c === "clean") {
        return new Set(["clean"]);
      }
      next.delete("clean");
      if (next.has(c)) next.delete(c);
      else next.add(c);
      if (next.size === 0) next.add("clean");
      return next;
    });
  }

  function start() {
    onStart({
      width,
      height,
      conditions: Array.from(conditions),
      stumps_count: conditions.has("stumps") ? stumpsCount : undefined,
    });
  }

  return (
    <div className="rounded-3xl bg-forest-800/60 p-6 ring-1 ring-forest-600/40 lg:p-10">
      <div className="text-xs uppercase tracking-[0.22em] text-wheat-400">
        Шаг 1 · Параметры
      </div>
      <h2 className="mt-2 font-display text-3xl font-semibold text-cream lg:text-4xl">
        Расскажите про участок
      </h2>
      <p className="mt-2 text-sm text-cream/70">
        Зная размер и состояние земли, мы сразу покажем точную смету.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Размер */}
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.18em] text-wheat-400">
            Размер участка
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumField
              label="Ширина"
              unit="м"
              value={width}
              min={5}
              max={50}
              onChange={setWidth}
            />
            <NumField
              label="Длина"
              unit="м"
              value={height}
              min={5}
              max={50}
              onChange={setHeight}
            />
          </div>
          <div className="rounded-2xl bg-forest-900/40 p-3 text-sm text-cream/70 ring-1 ring-forest-600/40">
            Площадь: <span className="font-display text-2xl text-cream">{area}</span> м²
            {tooLarge && (
              <div className="mt-1 text-xs text-copper">
                Слишком большой участок для конструктора — выберите до 2 500 м² (≈25 соток).
              </div>
            )}
          </div>
        </div>

        {/* Условия */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.18em] text-wheat-400">
            Состояние земли
          </div>
          <div className="space-y-2">
            {LAND_CONDITION_OPTIONS.map((opt) => {
              const checked = conditions.has(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleCond(opt.key)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition",
                    checked
                      ? "border-wheat-400/70 bg-wheat-500/10"
                      : "border-forest-600/40 bg-forest-900/40 hover:border-forest-500/60",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border transition",
                      checked
                        ? "border-wheat-400 bg-wheat-500 text-bark"
                        : "border-cream/40",
                    )}
                  >
                    {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        checked ? "text-wheat-400" : "text-cream",
                      )}
                    >
                      {opt.label}
                    </div>
                    <div className="text-xs text-cream/60">{opt.hint}</div>
                  </div>
                </button>
              );
            })}
            {conditions.has("stumps") && (
              <div className="ml-8 rounded-2xl bg-forest-900/40 p-3 ring-1 ring-forest-600/40">
                <NumField
                  label="Сколько пней/деревьев убрать?"
                  unit="шт"
                  value={stumpsCount}
                  min={1}
                  max={50}
                  onChange={setStumpsCount}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={tooLarge}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-wheat-500 px-6 py-3 font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Создать план <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function NumField({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  // Хранение как строка, чтобы пользователь мог свободно редактировать
  // (стирать всё, набирать заново). Валидация только при blur/Enter.
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit() {
    if (text === "") {
      setText(String(value));
      return;
    }
    const n = parseInt(text, 10);
    if (!Number.isFinite(n)) {
      setText(String(value));
      return;
    }
    const clamped = Math.max(min, Math.min(max, n));
    onChange(clamped);
    setText(String(clamped));
  }

  return (
    <label className="block">
      <span className="text-xs text-cream/60">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-forest-700/60 bg-forest-900/60 px-3 py-2">
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              (e.currentTarget as HTMLInputElement).blur();
            }
          }}
          className="w-full bg-transparent text-lg text-cream focus:outline-none"
        />
        <span className="text-xs text-cream/40">{unit}</span>
      </div>
      <span className="mt-1 block text-[10px] text-cream/40">
        от {min} до {max}
      </span>
    </label>
  );
}

// ============================================================
// ISOMETRIC GRID
// ============================================================

function IsometricGrid({
  width,
  height,
  cells,
  season,
  onPointerDown,
  onPointerEnter,
}: {
  width: number;
  height: number;
  cells: Cell[];
  season: Season;
  onPointerDown: (idx: number, e: React.PointerEvent) => void;
  onPointerEnter: (idx: number) => void;
}) {
  // Плоская сетка с легким 2.5D эффектом через drop-shadow и hover.
  // Без CSS 3D rotate — гарантированно стабильный pointer-events на каждой ячейке.
  return (
    <div
      className={cn(
        "relative rounded-3xl ring-1 ring-forest-600/40 transition-colors duration-700",
        season === "spring" && "bg-forest-700/40",
        season === "summer" && "bg-forest-800/50",
        season === "autumn" && "bg-[#3a2f24]",
        season === "winter" && "bg-[#1b2935]",
      )}
    >
      <div className="relative p-4 lg:p-6">
        <div
          className="mx-auto"
          style={{
            width: "min(100%, 900px)",
            aspectRatio: `${width} / ${height}`,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          <div
            className="grid h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${width}, 1fr)`,
              gridTemplateRows: `repeat(${height}, 1fr)`,
            }}
          >
            {cells.map((cell, i) => (
              <FlatCell
                key={i}
                cell={cell}
                season={season}
                onDown={(e) => onPointerDown(i, e)}
                onEnter={() => onPointerEnter(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlatCell({
  cell,
  season,
  onDown,
  onEnter,
}: {
  cell: Cell;
  season: Season;
  onDown: (e: React.PointerEvent) => void;
  onEnter: () => void;
}) {
  return (
    <div
      onPointerDown={onDown}
      onPointerEnter={onEnter}
      className="relative border border-forest-700/25 transition-colors hover:bg-wheat-500/10"
    >
      {/* Покрытие — плоско */}
      {cell.ground === "lawn" && <LawnIcon className="absolute inset-0 h-full w-full" season={season} />}
      {cell.ground === "path" && <PathIcon className="absolute inset-0 h-full w-full" />}
      {cell.ground === "water" && <WaterIcon className="absolute inset-0 h-full w-full" />}

      {/* Объект — с лёгкой тенью под ним, чтобы "стоял на земле" */}
      {cell.object && (
        <div
          className="absolute inset-0 grid place-items-center"
          style={{
            pointerEvents: "none",
            filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.45))",
          }}
        >
          <div className="h-[110%] w-[110%]">
            {cell.object === "tree" && <TreeIcon className="h-full w-full" season={season} />}
            {cell.object === "conifer" && <ConiferIcon className="h-full w-full" season={season} />}
            {cell.object === "bush" && <BushIcon className="h-full w-full" season={season} />}
            {cell.object === "flowerbed" && <FlowerBedIcon className="h-full w-full" season={season} />}
            {cell.object === "lamp" && <LampIcon className="h-full w-full" />}
            {cell.object === "bench" && <BenchIcon className="h-full w-full" />}
            {cell.object === "fountain" && <FountainIcon className="h-full w-full" />}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRICING PANEL
// ============================================================

function PricingPanel({
  pricing,
}: {
  pricing: ReturnType<typeof calculatePricing>;
}) {
  const cats = [pricing.preparation, pricing.coverings, pricing.objects];
  const nonEmpty = cats.filter((c) => c.items.length > 0);

  return (
    <div className="rounded-3xl bg-forest-800/40 p-4 ring-1 ring-forest-600/40">
      <div className="mb-2 text-xs uppercase tracking-[0.18em] text-wheat-400">
        Смета
      </div>
      {nonEmpty.length === 0 ? (
        <div className="py-4 text-center text-sm text-cream/50">
          Начните размещать элементы — здесь появится разбивка
        </div>
      ) : (
        <div className="space-y-3">
          {nonEmpty.map((cat) => (
            <details key={cat.key} open className="group">
              <summary className="flex cursor-pointer items-center justify-between list-none">
                <span className="text-sm font-medium text-cream">{cat.label}</span>
                <span className="font-display text-base text-wheat-400">
                  {formatRub(cat.total)}
                </span>
              </summary>
              <div className="mt-2 space-y-1 border-l border-forest-600/40 pl-3 text-xs">
                {cat.items.map((item, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="text-cream/70">
                      {item.name}{" "}
                      <span className="text-cream/40">
                        × {item.qty} {item.unit}
                      </span>
                    </span>
                    <span className="font-mono text-cream/80">{formatRub(item.total)}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LEAD DIALOG
// ============================================================

function LeadDialog({
  total,
  plan,
  counts,
  plotSize,
  landConditions,
  onClose,
}: {
  total: number;
  plan: string;
  counts: ElementCounts;
  plotSize: string;
  landConditions: string[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
          source: "sandbox",
          total_rub: total,
          counts,
          plan_svg: plan,
          plot_size: plotSize,
          land_conditions: landConditions,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data?.detail as string) ?? `HTTP ${res.status}`);
        return;
      }
      setSent(true);
    } catch {
      setError("Сеть. Попробуйте ещё или позвоните 8-937-038-83-44.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-forest-600/40 bg-forest-900 p-6 shadow-leaf">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-2xl text-wheat-400">
              {sent ? "Спасибо!" : "Хочу такой сад"}
            </div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-cream/50">
              {sent ? "заявка отправлена" : `план на ${formatRub(total)}`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-cream/60 transition hover:bg-forest-800 hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-cream/80">
              План и параметры участка сохранены. Алексей Юрьевич свяжется
              в ближайшие часы. Если срочно:
            </p>
            <a
              href="tel:+79370388344"
              className="flex items-center gap-3 rounded-2xl bg-wheat-500 px-5 py-3 font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400"
            >
              <Phone className="h-5 w-5" /> 8-937-038-83-44
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя"
              required
              className="w-full rounded-xl border border-forest-700/60 bg-forest-800/60 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-wheat-500/50 focus:outline-none"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              required
              className="w-full rounded-xl border border-forest-700/60 bg-forest-800/60 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-wheat-500/50 focus:outline-none"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Комментарий (необязательно)"
              rows={3}
              className="w-full resize-none rounded-xl border border-forest-700/60 bg-forest-800/60 px-4 py-3 text-cream placeholder:text-cream/40 focus:border-wheat-500/50 focus:outline-none"
            />
            {error && <div className="text-xs text-copper">{error}</div>}
            <button
              type="submit"
              disabled={busy || !name.trim() || !phone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-wheat-500 py-3 font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              {busy ? "Отправляю..." : "Отправить заявку"}
            </button>
            <p className="text-xs text-cream/40">
              Прикладываем размер участка, состояние земли, SVG-план и смету.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
