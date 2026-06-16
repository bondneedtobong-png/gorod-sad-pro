import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

/**
 * Prisma поверх Neon serverless-драйвера (WebSocket).
 * В отличие от обычного TCP-пула, он устойчив к тому, что Neon закрывает
 * простаивающие соединения (free-tier) — это убирает ошибки
 * «Server has closed the connection» и таймауты пула. Работает и локально
 * (долгоживущий dev-сервер), и на Vercel (serverless).
 *
 * Node 21+ имеет глобальный WebSocket; для Node 20 (Vercel) подставляем `ws`.
 */
if (!(globalThis as { WebSocket?: unknown }).WebSocket) {
  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makePrisma() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
