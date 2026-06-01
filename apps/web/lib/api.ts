// Если задан внешний бэкенд (FastAPI) — ходим к нему по HTTP.
// Иначе работаем на встроенных Next.js Route Handlers (/api/v1/*): на клиенте
// относительный путь резолвится сам, а на сервере/сборке (SSG) данные услуг
// читаем напрямую из lib/services-data, чтобы не падать на относительном fetch.
const EXTERNAL_API = process.env.NEXT_PUBLIC_API_URL?.trim() || null;
const API_URL = EXTERNAL_API ?? "/api/v1";

export interface Service {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  rate_per_m2: number;
  min_rub: number;
  unit: string;
}

export async function fetchService(slug: string): Promise<Service | null> {
  if (!EXTERNAL_API) {
    const { getServiceBySlug } = await import("@/lib/services-data");
    return getServiceBySlug(slug);
  }
  try {
    const res = await fetch(`${API_URL}/services/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Service;
  } catch {
    return null;
  }
}

export async function fetchServices(): Promise<Service[]> {
  if (!EXTERNAL_API) {
    const { SERVICES } = await import("@/lib/services-data");
    return SERVICES;
  }
  try {
    const res = await fetch(`${API_URL}/services`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items as Service[];
  } catch {
    return [];
  }
}

export interface EstimateRequest {
  service: string;
  area_m2: number;
  full_cycle?: boolean;
}

export interface EstimateResponse {
  service: string;
  service_title: string;
  unit: string;
  area_m2: number;
  rate_per_m2: number;
  base_rub: number;
  discount_rub: number;
  total_rub: number;
  note: string;
}

export async function estimate(req: EstimateRequest): Promise<EstimateResponse | null> {
  try {
    const res = await fetch(`${API_URL}/calculator/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    return (await res.json()) as EstimateResponse;
  } catch {
    return null;
  }
}

export function formatRub(n: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}
