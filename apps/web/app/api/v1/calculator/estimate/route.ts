import { NextResponse } from "next/server";

import { getService } from "@/lib/content";
import { estimateFromService } from "@/lib/services-data";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/calculator/estimate — предварительная стоимость услуги.
 * Тарифы берутся из БД (с откатом на статику); цифры совпадают с конструктором.
 */
export async function POST(req: Request) {
  let body: { service?: string; area_m2?: unknown; full_cycle?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "bad_json" }, { status: 400 });
  }

  const service = await getService(String(body.service ?? ""));
  if (!service) {
    return NextResponse.json({ detail: "unknown_service" }, { status: 400 });
  }

  const result = estimateFromService(
    service,
    Number(body.area_m2) || 0,
    Boolean(body.full_cycle),
  );
  return NextResponse.json(result);
}
