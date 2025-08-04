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

  // Convertir a formato Excel
  const worksheet = XLSX.utils.json_to_sheet(posts);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Publicaciones');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="publicaciones.xlsx"',
    },
  });
}
