import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DangerZone } from "@/components/account/danger-zone";
import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/ui-classes";

export const metadata: Metadata = { title: "Профиль — Город-сад" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, passwordHash: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-mist">Профиль</h1>

      <div className={cardClass}>
        <h2 className="mb-4 font-display text-xl font-semibold text-mist">Личные данные</h2>
        <ProfileForm initial={{ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }} />
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 font-display text-xl font-semibold text-mist">Пароль</h2>
        <PasswordForm hasPassword={Boolean(user?.passwordHash)} />
      </div>

      <div className={`${cardClass} ring-red-400/30`}>
        <DangerZone />
      </div>
    </div>
  );
}
