import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FavoriteRemove } from "@/components/account/favorite-remove";
import { PlantImage } from "@/components/plant-image";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/ui-classes";

export const metadata: Metadata = { title: "Избранное — Город-сад" };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { plant: { select: { slug: true, name: true, latin: true, image: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-forest-900">Избранные растения</h1>

      {favs.length === 0 ? (
        <div className={cardClass}>
          <p className="text-forest-600">
            Пока пусто. Откройте{" "}
            <Link href="/plants" className="text-wheat-700 underline">энциклопедию</Link> и нажимайте
            «сердечко» на понравившихся растениях.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((f) => (
            <div key={f.id} className="group relative overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-forest-200/70">
              <Link href={`/plants/${f.plant.slug}`}>
                <PlantImage src={f.plant.image} alt={f.plant.name} className="aspect-[4/3]" />
              </Link>
              <div className="p-4">
                <Link href={`/plants/${f.plant.slug}`} className="font-display text-lg text-forest-800 transition-colors hover:text-wheat-700">
                  {f.plant.name}
                </Link>
                <div className="text-xs italic text-forest-500">{f.plant.latin}</div>
              </div>
              <FavoriteRemove slug={f.plant.slug} className="absolute right-3 top-3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
