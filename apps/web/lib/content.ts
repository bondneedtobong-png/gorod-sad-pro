/**
 * Серверный слой доступа к контенту (растения, услуги).
 * Читает из БД (Prisma), но при отсутствии DATABASE_URL или любой ошибке
 * откатывается на статические данные — чтобы прод никогда не «опустел».
 *
 * Только для серверного кода (route handlers, server components). В клиентские
 * компоненты данные передаются пропсами.
 */
import type { Plant as DbPlant, Service as DbService } from "@prisma/client";

import type { Service } from "@/lib/api";
import {
  getPlantBySlug as staticPlant,
  PLANTS as STATIC_PLANTS,
  type Plant,
} from "@/lib/plants-data";
import {
  getServiceBySlug as staticService,
  SERVICES as STATIC_SERVICES,
} from "@/lib/services-data";

// БД используем во время выполнения (runtime/ISR), но НЕ во время сборки:
// на билде десятки страниц генерятся параллельно и упираются в пул Neon
// (таймауты). На сборке отдаём статику — мгновенно; свежие данные из БД
// подтянутся при первом запросе через ISR (revalidate).
const hasDb = () =>
  Boolean(process.env.DATABASE_URL) &&
  process.env.NEXT_PHASE !== "phase-production-build";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

function rowToPlant(r: DbPlant): Plant {
  return {
    slug: r.slug,
    name: r.name,
    latin: r.latin,
    category: r.category as Plant["category"],
    light: r.light as Plant["light"],
    care: r.care as Plant["care"],
    hardinessZone: r.hardinessZone,
    minZone: r.minZone,
    season: r.season,
    bloom: r.bloom as Plant["bloom"],
    winterInterest: r.winterInterest,
    height: r.height,
    short: r.short,
    description: r.description,
    uses: r.uses,
    image: r.image,
    tags: r.tags,
  };
}

function rowToService(r: DbService): Service {
  return {
    slug: r.slug,
    title: r.title,
    tagline: r.tagline,
    description: r.description,
    rate_per_m2: r.ratePerM2,
    min_rub: r.minRub,
    unit: r.unit,
  };
}

export async function getPlants(): Promise<Plant[]> {
  if (!hasDb()) return STATIC_PLANTS;
  try {
    const prisma = await getPrisma();
    const rows = await prisma.plant.findMany({ orderBy: { createdAt: "asc" } });
    return rows.length ? rows.map(rowToPlant) : STATIC_PLANTS;
  } catch {
    return STATIC_PLANTS;
  }
}

export async function getPlant(slug: string): Promise<Plant | null> {
  if (!hasDb()) return staticPlant(slug);
  try {
    const prisma = await getPrisma();
    const r = await prisma.plant.findUnique({ where: { slug } });
    return r ? rowToPlant(r) : staticPlant(slug);
  } catch {
    return staticPlant(slug);
  }
}

export async function getSimilarPlants(plant: Plant, count = 3): Promise<Plant[]> {
  const all = await getPlants();
  return all
    .filter((p) => p.category === plant.category && p.slug !== plant.slug)
    .slice(0, count);
}

export async function getServices(): Promise<Service[]> {
  if (!hasDb()) return STATIC_SERVICES;
  try {
    const prisma = await getPrisma();
    const rows = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return rows.length ? rows.map(rowToService) : STATIC_SERVICES;
  } catch {
    return STATIC_SERVICES;
  }
}

export async function getService(slug: string): Promise<Service | null> {
  if (!hasDb()) return staticService(slug);
  try {
    const prisma = await getPrisma();
    const r = await prisma.service.findUnique({ where: { slug } });
    return r ? rowToService(r) : staticService(slug);
  } catch {
    return staticService(slug);
  }
}
