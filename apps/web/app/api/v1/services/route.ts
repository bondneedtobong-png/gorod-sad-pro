import { NextResponse } from "next/server";

import { SERVICES } from "@/lib/services-data";

/**
 * GET /api/v1/services — список услуг.
 * Работает на Vercel serverless без FastAPI (данные из lib/services-data).
 */
export async function GET() {
  return NextResponse.json({ items: SERVICES, count: SERVICES.length });
}
