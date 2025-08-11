import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  // Leer parámetros de filtro
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');
  const ciudad = searchParams.get('ciudad');
  const titularidad = searchParams.get('titularidad');

  // Construir filtro dinámico para scrap_post
  const where: any = {};
  if (desde && hasta) {
    const desdeDate = new Date(desde);
    const hastaDate = new Date(hasta);
    // Incluir todo el día 'hasta'
    hastaDate.setHours(23,59,59,999);
    where.created_at = { gte: desdeDate, lte: hastaDate };
  } else if (desde) {
    const desdeDate = new Date(desde);
    where.created_at = { gte: desdeDate };
  } else if (hasta) {
    const hastaDate = new Date(hasta);
    hastaDate.setHours(23,59,59,999);
    where.created_at = { lte: hastaDate };
  }
  if (ciudad) {
    where.departamento = { equals: ciudad, mode: 'insensitive' };
  }
  if (titularidad) {
    where.titularidad = { equals: titularidad, mode: 'insensitive' };
  }

  // Obtener datos filtrados
  const posts = await prisma.scrap_post.findMany({ where });

  // Construir filtro dinámico para sin_publicacion
  const whereSin: any = {};
  if (desde && hasta) {
    const desdeDate = new Date(desde);
    const hastaDate = new Date(hasta);
    hastaDate.setHours(23,59,59,999);
    whereSin.fecha_scrap = { gte: desdeDate, lte: hastaDate };
  } else if (desde) {
    const desdeDate = new Date(desde);
    whereSin.fecha_scrap = { gte: desdeDate };
  } else if (hasta) {
    const hastaDate = new Date(hasta);
    hastaDate.setHours(23,59,59,999);
    whereSin.fecha_scrap = { lte: hastaDate };
  }
  if (ciudad) {
    whereSin.departamento = { equals: ciudad, mode: 'insensitive' };
  }
  if (titularidad) {
    whereSin.titularidad = { equals: titularidad, mode: 'insensitive' };
  }
  const sinActividad = await prisma.sin_publicacion.findMany({ where: whereSin });

  // Crear workbook y agregar ambas hojas
  const worksheetPosts = XLSX.utils.json_to_sheet(posts);
  const worksheetSin = XLSX.utils.json_to_sheet(sinActividad);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheetPosts, 'Publicaciones');
  XLSX.utils.book_append_sheet(workbook, worksheetSin, 'Sin actividad RRSS');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="publicaciones.xlsx"',
    },
  });
}
