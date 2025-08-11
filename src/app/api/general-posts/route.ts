import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    let fechaInicio: Date | undefined = undefined;
    let fechaFin: Date | undefined = undefined;

    if (desde) fechaInicio = new Date(desde);
    if (hasta) {
      fechaFin = new Date(hasta);
      fechaFin.setHours(23, 59, 59, 999);
    }

    // Filtro base para todos los posts (sin filtrar por departamento)
    const baseWhere: any = {};
    if (fechaInicio && fechaFin) {
      baseWhere.created_at = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    } else if (fechaInicio) {
      baseWhere.created_at = { gte: fechaInicio };
    } else if (fechaFin) {
      baseWhere.created_at = { lte: fechaFin };
    }

    // Obtener todos los posts de todos los departamentos
    const allPostsRaw = await prisma.scrap_post.findMany({
      where: baseWhere,
      orderBy: { created_at: "desc" },
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
        ...(baseWhere.created_at ? { created_at: baseWhere.created_at } : {}),
      },
      orderBy: { created_at: 'desc' },
    });
    const postsNacionales = postsNacionalesRaw.map(post => ({
      ...post,
      fechapublicacion: post.fechapublicacion || '',
    }));

    // Filtro de fechas para sin_publicacion
    let fechaFiltro: any = undefined;
    if (fechaInicio && fechaFin) {
      fechaFiltro = { gte: fechaInicio, lte: fechaFin };
    } else if (fechaInicio) {
      fechaFiltro = { gte: fechaInicio };
    } else if (fechaFin) {
      fechaFiltro = { lte: fechaFin };
    }

    // Obtener todos los registros sin actividad RRSS de todos los departamentos
    // Consulta SQL cruda para evitar error Prisma y filtrar departamento null o vacío
    let sinActividadRegistrosRaw: any[] = [];
    if (fechaFiltro && fechaFiltro.gte && fechaFiltro.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltro.gte} AND "fecha_scrap" <= ${fechaFiltro.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltro && fechaFiltro.gte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" >= ${fechaFiltro.gte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
    } else if (fechaFiltro && fechaFiltro.lte) {
      sinActividadRegistrosRaw = await prisma.$queryRaw`SELECT * FROM "sin_publicacion" WHERE "fecha_scrap" <= ${fechaFiltro.lte} AND "departamento" IS NOT NULL AND "departamento" <> '' ORDER BY "fecha_scrap" DESC LIMIT 500`;
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
