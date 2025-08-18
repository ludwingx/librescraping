import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Devuelve los candidatos que NO tienen publicaciones en el rango de fechas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    let fechaInicio: Date | undefined = undefined;
    let fechaFin: Date | undefined = undefined;
    if (desde) {
      const localDesde = new Date(desde + 'T00:00:00-04:00');
      fechaInicio = new Date(localDesde.toISOString());
    }
    if (hasta) {
      const localHasta = new Date(hasta + 'T23:59:59.999-04:00');
      fechaFin = new Date(localHasta.toISOString());
    }

    // Obtener todos los candidatos activos
    const candidatos = await prisma.candidatos.findMany({
      where: { status: 'activo' },
      orderBy: { id: 'asc' },
    });

    // Obtener todos los posts de todos los tiempos de todos los candidatos
    const postsEnRango = await prisma.scrap_post.findMany({
      where: {
        ...(fechaInicio && fechaFin ? { fechapublicacion: { gte: fechaInicio, lte: fechaFin } } :
           fechaInicio ? { fechapublicacion: { gte: fechaInicio } } :
           fechaFin ? { fechapublicacion: { lte: fechaFin } } : {}),
      },
      select: { candidatoid: true },
    });
    // Todos los candidatos que han publicado EN EL RANGO
    const candidatosConPostEnRango = new Set(postsEnRango.map(p => p.candidatoid));

    // Mostrar todos los candidatos que NO tengan publicaciones en el rango (incluye los que nunca han publicado)
    const sinActividadRegistros = candidatos.filter(c => !candidatosConPostEnRango.has(c.id));

    return NextResponse.json({ sinActividadRegistros });
  } catch (error) {
    console.error('[API/candidatos-sin-posts] Error:', error);
    return NextResponse.json({ sinActividadRegistros: [] }, { status: 500 });
  }
}
