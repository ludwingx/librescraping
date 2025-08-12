import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    // Convertir fechas locales (zona -04:00) a UTC para el filtro
    let fechaInicio: Date | undefined = undefined;
    let fechaFin: Date | undefined = undefined;
    if (desde) {
      const localDesde = new Date(desde + 'T00:00:00-04:00');
      fechaInicio = new Date(localDesde.toISOString()); // UTC
    }
    if (hasta) {
      const localHasta = new Date(hasta + 'T23:59:59.999-04:00');
      fechaFin = new Date(localHasta.toISOString()); // UTC
    }

    // Filtro base para todos los posts (sin filtrar por departamento)
    const baseWhere: any = {};
    if (fechaInicio && fechaFin) {
      baseWhere.fechapublicacion = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    } else if (fechaInicio) {
      baseWhere.fechapublicacion = { gte: fechaInicio };
    } else if (fechaFin) {
      baseWhere.fechapublicacion = { lte: fechaFin };
    }

    // Obtener todos los posts de todos los departamentos
    const allPostsRaw = await prisma.scrap_post.findMany({
      where: baseWhere,
      orderBy: { fechapublicacion: "desc" },
      take: 800,
    });
    const allPosts = allPostsRaw.map(post => ({
      ...post,
      fechapublicacion: post.fechapublicacion || '',
    }));

    // Obtener posts nacionales PRESIDENTE y VICEPRESIDENTE
    const postsNacionalesRaw = await prisma.scrap_post.findMany({
      where: {
        departamento: { equals: 'PAIS', mode: 'insensitive' },
        titularidad: { in: ['PRESIDENTE', 'VICEPRESIDENTE'] },
        ...(fechaInicio && fechaFin ? { fechapublicacion: { gte: fechaInicio, lte: fechaFin } } :
           fechaInicio ? { fechapublicacion: { gte: fechaInicio } } :
           fechaFin ? { fechapublicacion: { lte: fechaFin } } : {}),
      },
      orderBy: { fechapublicacion: 'desc' },
    });
    const postsNacionales = postsNacionalesRaw.map(post => ({
      ...post,
      fechapublicacion: post.fechapublicacion || '',
    }));

    // Filtro de fechas para sin_publicacion
    // Filtro de fechas local para sin_publicacion (solo días seleccionados, no últimas 24 horas)
    let fechaFiltroSin: { gte?: Date; lte?: Date } = {};
    if (fechaInicio) {
      const inicioLocal = new Date(fechaInicio);
      inicioLocal.setHours(0,0,0,0);
      fechaFiltroSin.gte = inicioLocal;
    }
    if (fechaFin) {
      const finLocal = new Date(fechaFin);
      finLocal.setHours(23,59,59,999);
      fechaFiltroSin.lte = finLocal;
    }

    // Consulta SQL cruda para evitar error Prisma y filtrar departamento null o vacío
    let sinActividadRegistrosRaw: any[] = [];
    if (fechaFiltroSin.gte && fechaFiltroSin.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltroSin.gte} AND "fecha_scrap" <= ${fechaFiltroSin.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltroSin.gte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltroSin.gte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltroSin.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" <= ${fechaFiltroSin.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    }
    const sinActividadRegistros = sinActividadRegistrosRaw;

    return NextResponse.json({ allPosts, postsNacionales, sinActividadRegistros });
  } catch (error) {
    console.error("[API/general-posts] Error:", error);
    return NextResponse.json({ allPosts: [], postsNacionales: [], sinActividadRegistros: [] });
  }
}
