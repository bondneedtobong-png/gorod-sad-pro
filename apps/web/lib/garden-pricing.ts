/**
 * Расчёт стоимости проекта в конструкторе сада.
 * Цены берутся отсюда — единый источник правды, чтобы не разъехались
 * между фронтом, бэком и админкой.
 */

export type LandCondition = "clean" | "overgrown" | "stumps" | "wet";

export interface PlotConfig {
  width: number;            // метры по горизонтали (одна ячейка = 1 м²)
  height: number;           // метры по вертикали
  conditions: LandCondition[];
  stumps_count?: number;    // используется только если conditions включает 'stumps'
}

export type GroundKey = "lawn" | "path" | "water";
export type ObjectKey =
  | "tree"
  | "conifer"
  | "bush"
  | "flowerbed"
  | "lamp"
  | "bench"
  | "fountain";
export type ElementKey = GroundKey | ObjectKey;

export const ELEMENT_PRICES: Record<ElementKey, number> = {
  lawn: 1200,
  path: 2500,
  water: 6000,
  tree: 8000,
  conifer: 6500,
  bush: 3000,
  flowerbed: 5000,
  lamp: 4500,
  bench: 15000,
  fountain: 50000,
};

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  lawn: "Газон",
  path: "Тротуарная плитка",
  water: "Водоём",
  tree: "Лиственные деревья",
  conifer: "Хвойные",
  bush: "Кусты",
  flowerbed: "Клумбы",
  lamp: "Освещение",
  bench: "Скамейки",
  fountain: "Фонтан",
};

export const LAND_CONDITION_OPTIONS: {
  key: LandCondition;
  label: string;
  hint: string;
}[] = [
  {
    key: "clean",
    label: "Чистый ровный участок",
    hint: "Готов к работам, доп. расходы 0 ₽",
  },
  {
    key: "overgrown",
    label: "Заросший бурьяном",
    hint: "Расчистка ~200 ₽/м²",
  },
  {
    key: "stumps",
    label: "С деревьями или пнями",
    hint: "Корчёвка ~5 000 ₽ за шт",
  },
  {
    key: "wet",
    label: "Болотистый / высокий грунтовод",
    hint: "Дренаж ~800 ₽/м²",
  },
];

const LAND_PRICE: Record<
  LandCondition,
  | { type: "free" }
  | { type: "per_m2"; rate: number; label: string }
  | { type: "per_count"; rate: number; label: string }
> = {
  clean:     { type: "free" },
  overgrown: { type: "per_m2",   rate: 200,  label: "Расчистка от бурьяна" },
  stumps:    { type: "per_count", rate: 5000, label: "Корчёвка пней" },
  wet:       { type: "per_m2",   rate: 800,  label: "Дренаж" },
};

export type ElementCounts = Partial<Record<ElementKey, number>>;

export interface BreakdownItem {
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface BreakdownCategory {
  key: string;
  label: string;
  items: BreakdownItem[];
  total: number;
}

export interface PricingBreakdown {
  preparation: BreakdownCategory;
  coverings: BreakdownCategory;
  objects: BreakdownCategory;
  grand_total: number;
  full_cycle_discount: number;
  final_total: number;
}

export function calculatePricing(
  config: PlotConfig,
  counts: ElementCounts,
  fullCycle = false,
): PricingBreakdown {
  const area = Math.max(0, config.width * config.height);

  // ---- Preparation ----
  const prepItems: BreakdownItem[] = [];
  for (const cond of config.conditions) {
    const p = LAND_PRICE[cond];
    if (p.type === "per_m2") {
      const total = area * p.rate;
      prepItems.push({ name: p.label, qty: area, unit: "м²", price: p.rate, total });
    } else if (p.type === "per_count") {
      const qty = config.stumps_count ?? 0;
      if (qty > 0) {
        const total = qty * p.rate;
        prepItems.push({ name: p.label, qty, unit: "шт", price: p.rate, total });
      }
    }
  }

  // ---- Coverings ----
  const covItems: BreakdownItem[] = [];
  for (const key of ["lawn", "path", "water"] as GroundKey[]) {
    const qty = counts[key] ?? 0;
    if (qty > 0) {
      const price = ELEMENT_PRICES[key];
      covItems.push({
        name: ELEMENT_LABELS[key],
        qty,
        unit: "м²",
        price,
        total: qty * price,
      });
    }
  }

  // ---- Objects ----
  const objItems: BreakdownItem[] = [];
  for (const key of [
    "tree",
    "conifer",
    "bush",
    "flowerbed",
    "lamp",
    "bench",
    "fountain",
  ] as ObjectKey[]) {
    const qty = counts[key] ?? 0;
    if (qty > 0) {
      const price = ELEMENT_PRICES[key];
      objItems.push({
        name: ELEMENT_LABELS[key],
        qty,
        unit: "шт",
        price,
        total: qty * price,
      });
    }
  }

  const sumCat = (items: BreakdownItem[]) =>
    items.reduce((sum, i) => sum + i.total, 0);

  const preparation = { key: "prep", label: "Подготовка участка", items: prepItems, total: sumCat(prepItems) };
  const coverings = { key: "cov", label: "Покрытия и зоны", items: covItems, total: sumCat(covItems) };
  const objects = { key: "obj", label: "Озеленение и объекты", items: objItems, total: sumCat(objItems) };

  const grand = preparation.total + coverings.total + objects.total;
  const discount = fullCycle ? Math.round(grand * 0.3) : 0;
  return {
    preparation,
    coverings,
    objects,
    grand_total: grand,
    full_cycle_discount: discount,
    final_total: grand - discount,
  };
}
