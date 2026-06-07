/**
 * Seed: переносит текущий статический контент в БД 1-в-1 и создаёт админа.
 * Запуск: `npm run db:seed` (после `npm run db:push` / миграции).
 * Идемпотентно (upsert по slug/email) — можно гонять повторно.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PLANTS } from "../lib/plants-data";
import { SERVICES } from "../lib/services-data";

// Сидируем через прямое (не-pooled) подключение, чтобы не упираться в PgBouncer.
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  // --- Растения ---
  for (const p of PLANTS) {
    const data = {
      name: p.name,
      latin: p.latin,
      category: p.category,
      light: p.light,
      care: p.care,
      hardinessZone: p.hardinessZone,
      minZone: p.minZone,
      season: p.season,
      bloom: p.bloom,
      winterInterest: Boolean(p.winterInterest),
      height: p.height,
      short: p.short,
      description: p.description,
      uses: p.uses,
      image: p.image,
      tags: p.tags ?? [],
    };
    await prisma.plant.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }
  console.log(`✓ растений: ${PLANTS.length}`);

  // --- Услуги ---
  let order = 0;
  for (const s of SERVICES) {
    const data = {
      title: s.title,
      tagline: s.tagline,
      description: s.description,
      ratePerM2: s.rate_per_m2,
      minRub: s.min_rub,
      unit: s.unit,
      order: order++,
    };
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: data,
      create: { slug: s.slug, ...data },
    });
  }
  console.log(`✓ услуг: ${SERVICES.length}`);

  // --- Админ из env ---
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", passwordHash },
      create: { email, name: "Администратор", passwordHash, role: "ADMIN" },
    });
    console.log(`✓ админ: ${email}`);
  } else {
    console.log("ℹ ADMIN_EMAIL/ADMIN_PASSWORD не заданы — админ не создан");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
