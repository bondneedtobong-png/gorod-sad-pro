import { NextResponse } from "next/server";

import { computeEstimate } from "@/lib/services-data";

/**
 * POST /api/v1/calculator/estimate — предварительная стоимость услуги.
 * Логика идентична бэкенду; цифры совпадают с конструктором сада.
 */
export async function POST(req: Request) {
  let body: { service?: string; area_m2?: unknown; full_cycle?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: "bad_json" }, { status: 400 });
  }

  const result = computeEstimate({
    service: String(body.service ?? ""),
    area_m2: Number(body.area_m2) || 0,
    full_cycle: Boolean(body.full_cycle),
  });

  if (!result) {
    return NextResponse.json({ detail: "unknown_service" }, { status: 400 });
  }
  return NextResponse.json(result);
}
