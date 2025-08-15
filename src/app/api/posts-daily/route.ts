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

// Normaliza URLs para reducir duplicados: quita protocolo, www, query, fragmento, slash final
function normalizeUrl(url?: string | null): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./i, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/g, ""); // quitar slashes finales
    return `${host}${path}`;
  } catch {
    // fallback simple si no es una URL válida
    return String(url).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[?#]/)[0].replace(/\/+$/g, "");
  }
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
        created_at: {
          gte: startUTC,
          lte: endUTC,
        },
        // Evita filas con candidatoid nulo/0 que inflan conteos y causan errores en prod
        candidatoid: { gt: 0 },
      },
      select: { id: true, created_at: true, posturl: true },
      orderBy: { created_at: "asc" },
    });

    // Construir el mapa de fechas usando día calendario en America/La_Paz
    const result: { date: string; count: number }[] = [];
    // Helper para avanzar un día en La Paz y obtener YYYY-MM-DD
    const nextYmd = (ymd: string) => ymdInLaPaz(addDays(localStartUTC(ymd), 1));
    let cursor = desde;
    while (true) {
      result.push({ date: cursor, count: 0 });
      if (cursor === hasta) break;
      cursor = nextYmd(cursor);
    }

    // Aggregate con deduplicación por URL de post dentro del mismo día (La Paz)
    const indexByDate = new Map(result.map((r, i) => [r.date, i]));
    const seen = new Set<string>(); // clave = `${date}::${normalizedUrl}`
    for (const p of posts) {
      const day = ymdInLaPaz(p.created_at as Date);
      const idx = indexByDate.get(day);
      if (idx === undefined) continue;
      const normalized = normalizeUrl((p as any).posturl);
      const k = `${day}::${normalized}`;
      if (seen.has(k)) continue;
      seen.add(k);
      result[idx].count += 1;
    }

    return NextResponse.json({ data: result });
  } catch (e) {
    console.error("/api/posts-daily error", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
