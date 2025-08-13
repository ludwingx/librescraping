import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Timezone: America/La_Paz (UTC-4, no DST)
const TZ_OFFSET_MIN = 4 * 60; // minutes

function parseDateYMD(d: string) {
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  return d;
}

function localStartUTC(ymd: string): Date {
  // 00:00:00.000 at -04:00 converted to UTC
  return new Date(`${ymd}T00:00:00.000-04:00`);
}
function localEndUTC(ymd: string): Date {
  // 23:59:59.999 at -04:00 converted to UTC
  return new Date(`${ymd}T23:59:59.999-04:00`);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function ymdInLaPaz(dateUTC: Date): string {
  // Shift -04:00 to get local date
  const shifted = new Date(dateUTC.getTime() - TZ_OFFSET_MIN * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const desde = parseDateYMD(searchParams.get("desde") || "");
  const hasta = parseDateYMD(searchParams.get("hasta") || "");

  if (!desde || !hasta) {
    return NextResponse.json(
      { error: "Parámetros inválidos. Use desde=YYYY-MM-DD&hasta=YYYY-MM-DD" },
      { status: 400 }
    );
  }

  try {
    const startUTC = localStartUTC(desde);
    const endUTC = localEndUTC(hasta);

    const posts = await prisma.scrap_post.findMany({
      where: {
        fechapublicacion: {
          gte: startUTC,
          lte: endUTC,
        },
      },
      select: { id: true, fechapublicacion: true },
      orderBy: { fechapublicacion: "asc" },
    });

    // Build full date map
    const result: { date: string; count: number }[] = [];
    const startLocal = new Date(desde + "T00:00:00");
    const endLocal = new Date(hasta + "T00:00:00");
    for (let d = new Date(startLocal); d <= endLocal; d = addDays(d, 1)) {
      result.push({ date: d.toISOString().slice(0, 10), count: 0 });
    }

    // Aggregate
    const indexByDate = new Map(result.map((r, i) => [r.date, i]));
    for (const p of posts) {
      const key = ymdInLaPaz(p.fechapublicacion as Date);
      const idx = indexByDate.get(key);
      if (idx !== undefined) result[idx].count += 1;
    }

    return NextResponse.json({ data: result });
  } catch (e) {
    console.error("/api/posts-daily error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
