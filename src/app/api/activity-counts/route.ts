import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/activity-counts?start=2025-08-01T00:00:00.000Z&end=2025-08-07T23:59:59.999Z
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  if (!startStr || !endStr) {
    return NextResponse.json({ error: "Missing start or end" }, { status: 400 });
  }
  const start = new Date(startStr);
  const end = new Date(endStr);
  const days: { label: string; value: number }[] = [];
  for (let i = 0; i < 31; ++i) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day > end) break;
    const label = `${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const value = await prisma.scrap_post.count({
      where: {
        fechapublicacion: { gte: dayStart, lte: dayEnd },
        candidatoid: { gt: 0 },
      },
    });
    days.push({ label, value });
  }
  return NextResponse.json({ data: days });
}
