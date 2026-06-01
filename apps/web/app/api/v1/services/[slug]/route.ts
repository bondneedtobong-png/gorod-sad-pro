import { NextResponse } from "next/server";

import { getServiceBySlug } from "@/lib/services-data";

/**
 * GET /api/v1/services/{slug} — одна услуга или 404.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const service = getServiceBySlug(params.slug);
  if (!service) {
    return NextResponse.json({ detail: "service_not_found" }, { status: 404 });
  }
  return NextResponse.json(service);
}
