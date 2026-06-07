import { NextResponse } from "next/server";

import { getService } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/services/{slug} — одна услуга из БД (с откатом на статику) или 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const service = await getService(params.slug);
  if (!service) {
    return NextResponse.json({ detail: "service_not_found" }, { status: 404 });
  }
  return NextResponse.json(service);
}
