import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";
import { z } from "zod";

import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email() });

// Всегда отвечаем ok — не раскрываем, существует ли email.
export async function POST(req: Request) {
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: true });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { email, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const origin = new URL(req.url).origin;
    await sendPasswordResetEmail(email, `${origin}/reset-password?token=${token}`);
  }

  return NextResponse.json({ ok: true });
}
