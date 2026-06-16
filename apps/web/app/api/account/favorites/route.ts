import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/favorites          → { authed, slugs:[] }
 * GET /api/account/favorites?slug=xxx → { authed, favorited }
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authed: false, favorited: false, slugs: [] });
  }
  const slug = new URL(req.url).searchParams.get("slug");

  if (!slug) {
    const favs = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { plant: { select: { slug: true } } },
    });
    return NextResponse.json({ authed: true, slugs: favs.map((f) => f.plant.slug) });
  }

  const plant = await prisma.plant.findUnique({ where: { slug }, select: { id: true } });
  if (!plant) return NextResponse.json({ authed: true, favorited: false });
  const fav = await prisma.favorite.findUnique({
    where: { userId_plantId: { userId: session.user.id, plantId: plant.id } },
  });
  return NextResponse.json({ authed: true, favorited: Boolean(fav) });
}
