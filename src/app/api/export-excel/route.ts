import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  // Leer parámetros de filtro
  const { searchParams } = new URL(req.url);
  const fecha = searchParams.get('fecha');
  const ciudad = searchParams.get('ciudad');
  const titularidad = searchParams.get('titularidad');

  // Construir filtro dinámico
  const where: any = {};
  if (fecha) {
    const day = new Date(fecha);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    where.created_at = { gte: day, lt: nextDay };
  }
  if (ciudad) {
    where.departamento = { equals: ciudad, mode: 'insensitive' };
  }
  if (titularidad) {
    where.titularidad = { equals: titularidad, mode: 'insensitive' };
  }

  // Obtener datos filtrados
  const posts = await prisma.scrap_post.findMany({ where });

  // Obtener datos de sin_publicacion (usuarios sin actividad en RRSS)
  const whereSin: any = {};
  if (fecha) {
    const day = new Date(fecha);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    whereSin.fecha_scrap = { gte: day, lt: nextDay };
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
