"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");
  return session.user.id;
}

/* ---------- Профиль ---------- */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function updateProfile(input: { name: string; phone: string }): Promise<Result> {
  const userId = await requireUserId();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Проверьте поля" };
  await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });
  revalidatePath("/account");
  return { ok: true };
}

const passwordSchema = z.object({
  current: z.string().optional(),
  next: z.string().min(8, "Минимум 8 символов").max(100),
});

export async function changePassword(input: {
  current?: string;
  next: string;
}): Promise<Result> {
  const userId = await requireUserId();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Пароль — минимум 8 символов" };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Пользователь не найден" };
  // Если пароль уже задан — проверяем текущий.
  if (user.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.current ?? "", user.passwordHash);
    if (!ok) return { ok: false, error: "Текущий пароль неверный" };
  }
  const passwordHash = await bcrypt.hash(parsed.data.next, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true };
}

export async function deleteAccount(): Promise<Result> {
  const userId = await requireUserId();
  // Каскад удалит сессии/аккаунты/избранное/проекты; заявки — userId в null.
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}

/* ---------- Согласие на cookies (лог) ---------- */

export async function logConsent(analytics: boolean): Promise<Result> {
  const session = await auth();
  await prisma.consentLog.create({
    data: { userId: session?.user?.id ?? null, analyticsConsent: analytics },
  });
  return { ok: true };
}

/* ---------- Избранные растения ---------- */

export async function toggleFavorite(
  slug: string,
): Promise<{ ok: true; favorited: boolean } | { ok: false; error: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "auth" };
  }
  const plant = await prisma.plant.findUnique({ where: { slug }, select: { id: true } });
  if (!plant) return { ok: false, error: "not_found" };

  const existing = await prisma.favorite.findUnique({
    where: { userId_plantId: { userId, plantId: plant.id } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/account/favorites");
    return { ok: true, favorited: false };
  }
  await prisma.favorite.create({ data: { userId, plantId: plant.id } });
  revalidatePath("/account/favorites");
  return { ok: true, favorited: true };
}

/* ---------- Сохранённые проекты конструктора ---------- */

export async function renameProject(id: string, name: string): Promise<Result> {
  const userId = await requireUserId();
  const clean = name.trim().slice(0, 120) || "Без названия";
  const res = await prisma.savedProject.updateMany({
    where: { id, userId },
    data: { name: clean },
  });
  if (res.count === 0) return { ok: false, error: "not_found" };
  revalidatePath("/account/projects");
  return { ok: true };
}

export async function deleteProject(id: string): Promise<Result> {
  const userId = await requireUserId();
  await prisma.savedProject.deleteMany({ where: { id, userId } });
  revalidatePath("/account/projects");
  return { ok: true };
}

/* ---------- Заявка (Deal) — может оставить и гость ---------- */

const dealSchema = z.object({
  serviceSlug: z.string().optional(),
  title: z.string().trim().max(160).optional(),
  message: z.string().trim().max(2000).optional(),
  contactName: z.string().trim().min(2, "Укажите имя").max(80),
  contactPhone: z.string().trim().min(5, "Укажите телефон").max(30),
  estimateRub: z.number().int().nonnegative().optional(),
  consent: z.literal(true),
});

export async function createDeal(input: {
  serviceSlug?: string;
  title?: string;
  message?: string;
  contactName: string;
  contactPhone: string;
  estimateRub?: number;
  consent: boolean;
}): Promise<Result> {
  const parsed = dealSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Проверьте имя, телефон и согласие на обработку данных" };
  }
  const session = await auth();
  await prisma.deal.create({
    data: {
      userId: session?.user?.id ?? null,
      serviceSlug: parsed.data.serviceSlug || null,
      title: parsed.data.title || "Заявка с сайта",
      message: parsed.data.message || null,
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      estimateRub: parsed.data.estimateRub ?? null,
    },
  });
  if (session?.user?.id) revalidatePath("/account/deals");
  return { ok: true };
}
