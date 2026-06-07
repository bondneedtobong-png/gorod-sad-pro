import { PrismaClient } from "@prisma/client";

// Синглтон PrismaClient — чтобы в dev/hot-reload и в serverless не плодить
// подключения (важно для free-tier пула Neon).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
