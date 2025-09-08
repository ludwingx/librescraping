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
import { BarChart3, Download, FileText, PieChart, Users } from "lucide-react";
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
    <div className="flex flex-col min-h-screen">
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
      
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0  via-white to-white min-h-screen">
        <div className="bg-white p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
            <div className="flex flex-col ">
              <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
              <p className="text-sm text-gray-500">Resumen general de actividad en redes sociales</p>
            </div>
            <ExcelDownloadModal 
              posts={posts} 
              sinActividad={[]} 
              departamentoNombre={"General"}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
        <div className="w-full mx-auto  px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-stretch w-full">
        
            {/* Primera fila de métricas principales - 3 cards en una fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
              {/* Card 1: Candidatos activos ayer */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" /> Activos ayer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-2xl font-bold text-blue-700">{activeYesterday}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{yStr}</p>
                </CardContent>
              </Card>

              {/* Card 2: Total candidatos */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-green-500" /> Total candidatos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-2xl font-bold text-green-600">{totalCandidates}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Registrados</p>
                </CardContent>
              </Card>

              {/* Card 3: % Participación */}
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-purple-500" /> Participación
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalCandidates > 0 ? ((activeYesterday / totalCandidates) * 100).toFixed(1) : 0}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Últimas 24h</p>
                </CardContent>
              </Card>
            </div>

            {/* Segunda fila: Distribución por red con dos cards a la derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full mt-4">
              {/* Card: Distribución por red social */}
              <Card className="lg:col-span-2 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-muted-foreground">
                    Distribución por red social
                  </CardTitle>
                  <CardDescription className="text-xs">Actividad de los últimos 7 días</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-6 flex-1 flex flex-col items-center justify-center min-h-[350px] lg:min-h-[400px] p-4">
                  <SocialMediaPieChart 
                    data={[
                      { platform: 'Facebook', count: fb7 },
                      { platform: 'Instagram', count: ig7 },
                      { platform: 'TikTok', count: tk7 }
                    ]} 
                  />
                  <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs font-semibold text-blue-600">Facebook</div>
                      <div className="text-lg font-bold text-blue-700">{totalNet7 > 0 ? ((fb7 / totalNet7) * 100).toFixed(1) : 0}%</div>
                      <div className="text-xs text-muted-foreground">{fb7} publicaciones</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-pink-600">Instagram</div>
                      <div className="text-lg font-bold text-pink-700">{totalNet7 > 0 ? ((ig7 / totalNet7) * 100).toFixed(1) : 0}%</div>
                      <div className="text-xs text-muted-foreground">{ig7} publicaciones</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-amber-600">TikTok</div>
                      <div className="text-lg font-bold text-amber-700">{totalNet7 > 0 ? ((tk7 / totalNet7) * 100).toFixed(1) : 0}%</div>
                      <div className="text-xs text-muted-foreground">{tk7} publicaciones</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Grid anidado para las otras 3 cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card: Publicaciones ayer */}
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Publicaciones ayer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-700">{postsYesterdayCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">Fecha: {yStr}</p>
                  </CardContent>
                </Card>
                {/* Card: Candidatos inactivos */}
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Candidatos inactivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-amber-600">{candidatesNoActivityYesterday}</div>
                    <p className="text-xs text-muted-foreground mt-1">De {totalCandidates} totales ({(totalCandidates > 0 ? (candidatesNoActivityYesterday / totalCandidates * 100).toFixed(1) : 0)}%)</p>
                  </CardContent>
                </Card>
                {/* Card: Departamento con más actividad ayer (debajo, ocupando 2 columnas) */}
                <Card className="bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Departamento con más actividad ayer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-700">{topDeptYesterday}</div>
                        <p className="text-sm text-muted-foreground mt-1">{topDeptYesterdayCount} publicaciones</p>
                      </div>
                      <div className="text-4xl">🏆</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <CandidateActivityOverview />
          </div>
          <div className="pt-4">
            <CandidatePostCounts />
          </div>
        </div>
        
      </main>
      
    </div>
    
  );
}