"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PlantImage } from "@/components/plant-image";
import { Reveal } from "@/components/reveal";
import { type Plant } from "@/lib/plants-data";
import { cn } from "@/lib/utils";

/**
 * Каталог энциклопедии: поиск (RU + латынь) + фильтры (категория и
 * сезон/зимостойкость). Фильтры комбинируются, мгновенно, без перезагрузки.
 * Состояние — в React-стейте (не localStorage).
 */

interface Feature {
  key: string;
  label: string;
  test: (p: Plant) => boolean;
}

const FEATURES: Feature[] = [
  { key: "spring", label: "Цветёт весной", test: (p) => p.bloom.includes("Весна") },
  { key: "summer", label: "Цветёт летом", test: (p) => p.bloom.includes("Лето") },
  { key: "autumn", label: "Осенний декор", test: (p) => p.bloom.includes("Осень") },
  {
    key: "winter",
    label: "Декоративно зимой",
    test: (p) => Boolean(p.winterInterest) || p.bloom.includes("Зима"),
  },
  { key: "hardy", label: "Зимостойкое (зона ≤3)", test: (p) => p.minZone <= 3 },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-medium text-forest-600 ring-1 ring-forest-200/70">
      {children}
    </span>
  );
}

export function PlantsCatalog({ plants }: { plants: Plant[] }) {
  const categories = useMemo(
    () => Array.from(new Set(plants.map((p) => p.category))),
    [plants],
  );
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [features, setFeatures] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (q && !`${p.name} ${p.latin}`.toLowerCase().includes(q)) return false;
      if (cats.size && !cats.has(p.category)) return false;
      if (features.size) {
        const ok = [...features].some(
          (k) => FEATURES.find((f) => f.key === k)?.test(p),
        );
        if (!ok) return false;
      }
      return true;
    });
  }, [plants, query, cats, features]);

  const hasFilters = query.trim() !== "" || cats.size > 0 || features.size > 0;
  const reset = () => {
    setQuery("");
    setCats(new Set());
    setFeatures(new Set());
  };

  return (
    <div>
      {/* Поиск */}
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию или латыни…"
          aria-label="Поиск растений"
          className="w-full rounded-full border border-forest-200 bg-paper py-3 pl-11 pr-4 text-sm text-forest-800 placeholder:text-forest-500/70 shadow-sm transition focus:border-wheat-500 focus:outline-none focus:ring-2 focus:ring-wheat-500/30"
        />
      </div>

      {/* Фильтры */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-forest-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Категория
          </span>
          {categories.map((c) => (
            <FilterChip
              key={c}
              active={cats.has(c)}
              onClick={() => setCats((s) => toggle(s, c))}
            >
              {c}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs uppercase tracking-[0.18em] text-forest-500">
            Сезон и зимостойкость
          </span>
          {FEATURES.map((f) => (
            <FilterChip
              key={f.key}
              active={features.has(f.key)}
              onClick={() => setFeatures((s) => toggle(s, f.key))}
            >
              {f.label}
            </FilterChip>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-forest-600 underline-offset-2 transition hover:text-wheat-700 hover:underline"
            >
              <X className="h-3.5 w-3.5" /> Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Счётчик */}
      <div className="mb-5 text-sm text-forest-600">
        Найдено: <span className="font-semibold text-forest-800">{filtered.length}</span>{" "}
        из {plants.length}
      </div>

      {/* Сетка */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i, 5) * 60}>
              <Link
                href={`/plants/${p.slug}`}
                className="group block h-full overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-forest-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_48px_-22px_rgba(21,40,26,0.5)] hover:ring-wheat-500/50"
              >
                <PlantImage src={p.image} alt={p.name} className="aspect-[4/3]" />
                <div className="p-5">
                  <div className="font-display text-xl text-forest-800 transition-colors group-hover:text-wheat-700">
                    {p.name}
                  </div>
                  <div className="text-sm italic text-forest-500">{p.latin}</div>
                  <p className="mt-2 text-sm leading-relaxed text-forest-700/80">{p.short}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Pill>{p.category}</Pill>
                    <Pill>{p.light.join(" / ")}</Pill>
                    <Pill>зона {p.hardinessZone}</Pill>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-forest-300/70 bg-paper/60 px-6 py-16 text-center">
          <div className="font-display text-2xl text-forest-700">Ничего не найдено</div>
          <p className="mx-auto mt-2 max-w-sm text-sm text-forest-600">
            Попробуйте смягчить фильтры или изменить запрос — в каталоге пока{" "}
            {plants.length} растений, и он растёт.
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-wheat-500 px-5 py-2.5 text-sm font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
            >
              <X className="h-4 w-4" /> Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm transition ring-1",
        active
          ? "bg-wheat-500 text-forest-900 ring-wheat-500 shadow-wheat-glow"
          : "bg-paper text-forest-700 ring-forest-200/70 hover:ring-wheat-500/50 hover:text-wheat-700",
      )}
    >
      {children}
    </button>
  );
}
