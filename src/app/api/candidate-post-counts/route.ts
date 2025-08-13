import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const titularidad = searchParams.get("titularidad");
    const departamento = searchParams.get("departamento");

    let gte: Date | undefined;
    let lte: Date | undefined;

    if (desde) gte = new Date(desde);
    if (hasta) {
      const end = new Date(hasta);
      end.setHours(23, 59, 59, 999);
      lte = end;
    }

    const where: any = {};
    if (gte || lte) {
      where.fechapublicacion = {} as any;
      if (gte) (where.fechapublicacion as any).gte = gte;
      if (lte) (where.fechapublicacion as any).lte = lte;
    }
    if (titularidad) {
      where.titularidad = titularidad;
    }
    if (departamento) {
      where.departamento = departamento;
    }

    // group posts by candidate id
    const grouped = await prisma.scrap_post.groupBy({
      where,
      by: ["candidatoid"],
      _count: { _all: true },
      _sum: { likes: true },
    });

    // Obtener todos los candidatos (incluye los que no tienen publicaciones en el rango)
    const candidates = await prisma.candidatos.findMany({
      where: {
        ...(titularidad ? { titularidad } : {}),
        ...(departamento ? { departamento } : {}),
      },
      select: {
        id: true,
        nombre_completo: true,
        titularidad: true,
        departamento: true,
      },
    });

    const map = new Map<number, number>(grouped.map((g) => [g.candidatoid, g._count._all]));
    const likesMap = new Map<number, number>(grouped.map((g) => [g.candidatoid, (g._sum?.likes as number) || 0]));

    const titularidadOrder = [
      "PRESIDENTE",
      "VICEPRESIDENTE",
      "SENADOR",
      "DIPUTADO PLURINOMINAL",
      "DIPUTADO UNINOMINAL URBANO",
      "DIPUTADO UNINOMINAL RURAL",
      "DIPUTADO SUPRAESTATAL",
      "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
    ];
    const orderIndex = (t: string) => {
      const i = titularidadOrder.indexOf((t || "").toUpperCase());
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };

    // Orden personalizado por departamento
    const deptOrder = [
      "SANTA CRUZ",
      "BENI",
      "PANDO",
      "COCHABAMBA",
      "CHUQUISACA",
      "TARIJA",
      "LA PAZ",
      "ORURO",
      "POTOSI",
    ];
    const deptIndex = (d: string) => {
      const i = deptOrder.indexOf((d || "").toUpperCase());
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };

    const data = candidates
      .map((c) => ({
        id: c.id,
        nombre_completo: c.nombre_completo,
        titularidad: c.titularidad,
        departamento: c.departamento,
        total_posts: map.get(c.id) || 0,
        total_likes: likesMap.get(c.id) || 0,
      }))
      .sort((a, b) => {
        // 1) Más posts primero
        const diffCount = b.total_posts - a.total_posts;
        if (diffCount !== 0) return diffCount;
        // 2) Luego por titularidad (orden fijo)
        const diffTit = orderIndex(a.titularidad) - orderIndex(b.titularidad);
        if (diffTit !== 0) return diffTit;
        // 3) Luego por departamento (orden fijo)
        const diffDept = deptIndex(a.departamento) - deptIndex(b.departamento);
        if (diffDept !== 0) return diffDept;
        // 4) Finalmente por nombre
        return a.nombre_completo.localeCompare(b.nombre_completo);
      });

    return NextResponse.json({ data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}
