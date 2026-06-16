import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProjectItem } from "@/components/account/project-item";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/ui-classes";

export const metadata: Metadata = { title: "Мои проекты — Город-сад" };

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const projects = await prisma.savedProject.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-forest-900">Мои проекты</h1>

      {projects.length === 0 ? (
        <div className={cardClass}>
          <p className="text-forest-600">
            Пока нет сохранённых проектов. Откройте{" "}
            <Link href="/sandbox" className="text-wheat-700 underline">конструктор сада</Link>, соберите
            план участка и нажмите «Сохранить проект» — он появится здесь.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <ProjectItem
              key={p.id}
              id={p.id}
              name={p.name}
              estimateRub={p.estimateRub}
              updatedAt={p.updatedAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
