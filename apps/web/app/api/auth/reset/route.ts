import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Минимум 8 символов").max(100),
});

export async function POST(req: Request) {
  if (!rateLimit(`reset:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const rec = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });
  if (!rec || rec.expires < new Date()) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { email: rec.email }, data: { passwordHash } });
  await prisma.passwordResetToken.deleteMany({ where: { email: rec.email } });

  return NextResponse.json({ ok: true });
}
