import type { EstimateRequest, EstimateResponse, Service } from "./api";

/**
 * Данные услуг — единый источник правды для фронта без FastAPI.
 *
 * Синхронизированы с бэкендом (apps/api/app/main.py: SERVICES). Ставки за м²
 * совпадают с ценами конструктора сада (lib/garden-pricing.ts: lawn = 1200,
 * paving/path = 2500 и т.д.), чтобы цифры калькулятора и конструктора не
 * расходились.
 *
 * Используется Next.js Route Handlers (app/api/v1/*) и серверными компонентами
 * напрямую — благодаря этому услуги и калькулятор работают на Vercel «из коробки».
 */
export const SERVICES: Service[] = [
  {
    slug: "landscape-design",
    title: "Ландшафтное проектирование",
    tagline: "С учётом всех пожеланий",
    description:
      "Создаём проект участка с нуля: концепция, дендроплан, разбивочный чертёж, " +
      "визуализация. Учитываем рельеф, инсоляцию, потоки воды и ваши пожелания.",
    rate_per_m2: 800,
    min_rub: 25_000,
    unit: "м² участка",
  },
  {
    slug: "paving",
    title: "Укладка тротуарной плитки",
    tagline: "Стиль от заказа до обустройства",
    description:
      "От подготовки основания до финального шва. Брусчатка, клинкер, " +
      "натуральный камень — подбираем под архитектуру дома.",
    rate_per_m2: 2_500,
    min_rub: 30_000,
    unit: "м² мощения",
  },
  {
    slug: "lawn",
    title: "Обустройство газонов",
    tagline: 'Зелёная мягкость "Под ключ"',
    description:
      "Рулонный или посевной газон. Полная подготовка почвы, дренаж, " +
      "автополив и уход в первый сезон.",
    rate_per_m2: 1_200,
    min_rub: 20_000,
    unit: "м² газона",
  },
  {
    slug: "lighting",
    title: "Ландшафтное освещение",
    tagline: "Свет природы подчеркнёт Ваш вкус",
    description:
      "Подсветка деревьев, дорожек, водоёмов. Энергосберегающие LED-светильники " +
      "с автоматикой по таймеру и сумеречному датчику.",
    rate_per_m2: 4_500,
    min_rub: 40_000,
    unit: "м² подсветки",
  },
  {
    slug: "irrigation",
    title: "Автополив",
    tagline: "С заботой о каждом растении",
    description:
      "Капельный, веерный, скрытый — подбираем под зону. Управление через " +
      "смартфон. Учитываем погодные датчики.",
    rate_per_m2: 1_800,
    min_rub: 35_000,
    unit: "м² зоны полива",
  },
  {
    slug: "topiary",
    title: "Топиарная стрижка",
    tagline: "Создание сложных фигур и композиций из растений",
    description:
      "Формируем шары, конусы, спирали, живые скульптуры. Регулярный уход " +
      "с сохранением заданной формы.",
    rate_per_m2: 0,
    min_rub: 8_000,
    unit: "за одну фигуру",
  },
];

export function getServiceBySlug(slug: string): Service | null {
  return SERVICES.find((s) => s.slug === slug) ?? null;
}

/**
 * Расчёт стоимости услуги. Полностью повторяет логику бэкенда:
 *   base = max(min_rub, area × rate_per_m2)
 *   при комплексе работ — скидка 30%.
 * Возвращает ту же форму EstimateResponse, что ждёт фронт (lib/api.ts).
 */
/** Чистый расчёт по объекту услуги (источник — статика ИЛИ БД). */
export function estimateFromService(
  service: Service,
  areaM2: number,
  fullCycle = false,
): EstimateResponse {
  const area = Number.isFinite(areaM2) ? Math.max(0, areaM2) : 0;
  const base = Math.max(service.min_rub, Math.floor(area * service.rate_per_m2));

  let total = base;
  let discount = 0;
  if (fullCycle) {
    discount = Math.floor(total * 0.3);
    total -= discount;
  }

  return {
    service: service.slug,
    service_title: service.title,
    unit: service.unit,
    area_m2: area,
    rate_per_m2: service.rate_per_m2,
    base_rub: base,
    discount_rub: discount,
    total_rub: total,
    note: "Окончательная стоимость уточняется после выезда специалиста (бесплатно).",
  };
}

export function computeEstimate(req: EstimateRequest): EstimateResponse | null {
  const service = getServiceBySlug(req.service);
  if (!service) return null;
  return estimateFromService(service, req.area_m2, req.full_cycle);
}
