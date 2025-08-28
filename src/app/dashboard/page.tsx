import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import prisma from "@/lib/prisma";

import { ExcelDownloadModal } from "@/components/ExcelDownloadModal";
import { CandidatePostCounts } from "@/components/CandidatePostCounts";
import { CandidateActivityOverview } from "@/components/CandidateActivityOverview";
import { SocialMediaPieChart } from "@/components/dashboard/SocialMediaPieChart";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { BarChart3, Download, PieChart, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ParticipationPieChart } from "@/components/dashboard/ParticipationPieChart";

export default async function Page() {

  // Helper: get YYYY-MM-DD string for La Paz tz (UTC-4)
  function getLaPazDateString(d: Date) {
    const laPaz = new Date(d.getTime() - 4 * 60 * 60 * 1000);
    const y = laPaz.getUTCFullYear();
    const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
    const day = String(laPaz.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const now = new Date();
  // Yesterday in La Paz
  const laPazNow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const laPazYesterday = new Date(laPazNow);
  laPazYesterday.setUTCDate(laPazNow.getUTCDate() - 1);
  const yStr = getLaPazDateString(laPazYesterday);
  const yStart = new Date(`${yStr}T00:00:00-04:00`);
  const yEnd = new Date(`${yStr}T23:59:59.999-04:00`);

  // 7-day window ending yesterday (inclusive)
  const start7LaPaz = new Date(laPazYesterday);
  start7LaPaz.setUTCDate(laPazYesterday.getUTCDate() - 6);
  const start7Str = getLaPazDateString(start7LaPaz);
  const start7 = new Date(`${start7Str}T00:00:00-04:00`);
  const end7 = yEnd;

  const posts = (
    await prisma.scrap_post.findMany({
      where: { redsocial: "Facebook", candidatoid: { gt: 0 } },
      orderBy: { fechapublicacion: "desc" },
      // ¡Sin límite! Trae todos los posts para el filtro en el modal
    })
  ).map((post) => ({
    ...post,
    created_at:
      post.created_at instanceof Date
        ? post.created_at.toISOString()
        : post.created_at,
    fechapublicacion:
      post.fechapublicacion instanceof Date
        ? post.fechapublicacion.toISOString()
        : post.fechapublicacion,
  }));

  // Metrics
  const totalCandidates = await prisma.candidatos.count();
  const activeYesterdayDistinct = await prisma.scrap_post.findMany({
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
      candidatoid: { gt: 0 },
    },
    distinct: ["candidatoid"],
    select: { candidatoid: true },
  });
  const activeYesterday = activeYesterdayDistinct.length;
  const participantsPct = totalCandidates > 0 ? (activeYesterday / totalCandidates) * 100 : 0;
  const nonParticipantsPct = 100 - participantsPct;

  const posts7d = await prisma.scrap_post.count({
    where: {
      fechapublicacion: { gte: start7, lte: end7 },
    },
  });
  const avgDaily7d = posts7d / 7;

  // Extra metrics for more cards
  const postsYesterdayCount = await prisma.scrap_post.count({
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
    },
  });

  const candidatesNoActivityYesterday = Math.max(
    0,
    totalCandidates - activeYesterday
  );

  // Top departamento by posts yesterday
  const topDeptGroups = await prisma.scrap_post.groupBy({
    by: ["departamento"],
    where: {
      fechapublicacion: { gte: yStart, lte: yEnd },
      candidatoid: { gt: 0 },
    },
    _count: { _all: true },
  });
  const topDeptSorted = topDeptGroups.sort((a, b) => (b._count._all ?? 0) - (a._count._all ?? 0));
  const topDeptYesterday = topDeptSorted[0]?.departamento || "Sin datos";
  const topDeptYesterdayCount = topDeptSorted[0]?._count._all || 0;

  // Distribution by network last 7 days
  const byNetwork7d = await prisma.scrap_post.groupBy({
    by: ["redsocial"],
    where: { fechapublicacion: { gte: start7, lte: end7 } },
    _count: { _all: true },
  });
  const netMap: Record<string, number> = {};
  for (const row of byNetwork7d) {
    netMap[row.redsocial] = row._count._all;
  }
  const fb7 = netMap["Facebook"] || 0;
  const ig7 = netMap["Instagram"] || 0;
  const tk7 = netMap["TikTok"] || 0;
  const totalNet7 = fb7 + ig7 + tk7 || 1; // avoid div by zero


  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center w-full gap-2 px-4">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb className="truncate">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 ml-auto pr-3">
            <img
              className="w-35 h-10 object-contain pr-2"
              src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75"
              alt="Libre-Scraping Logo 1"
            />
            <img
              className="w-23 h-10 object-contain pr-2"
              src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75"
              alt="Libre-Scraping Logo 2"
            />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-b from-blue-50 via-white to-white min-h-screen">
        <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-stretch w-full">
        
            {/* Cards resumen (4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Card 1: Candidatos activos ayer */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Candidatos activos ayer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{activeYesterday}</div>
                  <p className="text-xs text-muted-foreground mt-1">Fecha: {yStr}</p>
                </CardContent>
              </Card>

              {/* Card 2: % Participación ayer */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Participación de candidatos (ayer)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ParticipationPieChart 
                    active={activeYesterday} 
                    total={totalCandidates} 
                    candidateName="candidatos"
                    date={yStr}
                  />
                </CardContent>
              </Card>

              {/* Card 3: Promedio publicaciones diarios (7d) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Promedio diario (últimos 7 días)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{avgDaily7d.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Rango: {start7Str} al {yStr}</p>
                </CardContent>
              </Card>

              {/* Card 4: Descargar Excel (compacto) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" /> Descargar Excel
                  </CardTitle>
                  <CardDescription>
                    Descarga un archivo Excel con los datos de las publicaciones.
                  </CardDescription>

                </CardHeader>
                <CardContent>
                  <ExcelDownloadModal posts={posts} sinActividad={[]} departamentoNombre={"General"} />
                </CardContent>
              </Card>
            </div>
            {/* Más métricas (4 nuevas cards) */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {/* Card: Publicaciones de ayer */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Publicaciones ayer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{postsYesterdayCount}</div>
                  <p className="text-xs text-muted-foreground mt-1">Fecha: {yStr}</p>
                </CardContent>
              </Card>

              {/* Card: Candidatos sin actividad ayer */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Candidatos sin actividad (ayer)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-600">{candidatesNoActivityYesterday}</div>
                  <p className="text-xs text-muted-foreground mt-1">De {totalCandidates} totales</p>
                </CardContent>
              </Card>

              {/* Card ancha (col-span-2): Distribución por red (7 días) */}
              <div className="lg:col-span-2">
                <SocialMediaPieChart 
                  data={[
                    { platform: 'Facebook', count: fb7 },
                    { platform: 'Instagram', count: ig7 },
                    { platform: 'TikTok', count: tk7 }
                  ]} 
                />
              </div>

            </div>
            <div className="pt-4">
              <CandidateActivityOverview />
            </div>
            <CandidatePostCounts />
            </div>

            
          </div>
      </main>
    </>
  );
}