import { NextResponse } from "next/server";

import { getServices } from "@/lib/content";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/services — список услуг из БД (с откатом на статику).
 */
export async function GET() {
  const items = await getServices();
  return NextResponse.json({ items, count: items.length });
}
