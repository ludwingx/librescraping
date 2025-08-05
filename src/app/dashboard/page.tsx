import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import prisma from "@/lib/prisma";

import ExcelDownloaderClient from "@/app/dashboard/ExcelDownloaderClient";
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { BarChart3, Download, Users } from "lucide-react";

export default async function Page  () {
  // Obtener resumen de publicaciones por titularidad
  // Obtener la fecha de hoy en formato ISO (sin hora)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Resumen de publicaciones por titularidad solo para hoy
  const resumen = await prisma.scrap_post.groupBy({
    by: ['titularidad'],
    where: {
      created_at: {
        gte: today,
        lt: tomorrow,
      },
    },
    _count: { _all: true },
  });

  // Obtener cantidad de los que no han publicado por titularidad
  const sinPublicacion = await prisma.sin_publicacion.groupBy({
    by: ['titularidad'],
    where: {
      fecha_scrap: {
        gte: today,
        lt: tomorrow,
      },
    },
    _count: { _all: true },
  });

  const posts = await prisma.scrap_post.findMany({
    where: { redsocial: "Facebook" },
    orderBy: { fechapublicacion: "desc" },
    take: 20,
  });
  console.log(posts);
  return (
    <> 
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center w-full gap-2 px-4">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb className="truncate">
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 ml-auto pr-3">
            <img className="w-35 h-10 object-contain pr-2" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
            <img className="w-23 h-10 object-contain pr-2" src="https://tuto-noticias-test.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
            <h2 className="text-4xl font-extrabold mb-2 text-blue-800 tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-lg mb-8">Visualiza estadísticas y accede rápidamente a los reportes de Libre Scraping.</p>

            {/* Bloques de navegación grandes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-10">
              <QuickActionCard
                title="Santa Cruz"
                icon={BarChart3}
                href="/dashboard/santacruz"
                variant="outline"
                className="text-blue-800 border-blue-300 hover:bg-blue-50"
              />
              <QuickActionCard
                title="General RRSS"
                icon={Users}
                href="/dashboard/igeneral"
                variant="outline"
                className="text-green-800 border-green-300 hover:bg-green-50"
              />
              <QuickActionCard
                title="Descargar Excel"
                icon={Download}
                href="#descarga"
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
              />
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-10">
              {/* Publicaciones por titularidad */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" /> Publicaciones por titularidad
                </h3>
                <ul className="divide-y divide-blue-50 w-full">
                  {resumen.map((item) => (
                    <li key={item.titularidad} className="flex justify-between px-2 py-2 text-blue-900">
                      <span className="font-medium">{item.titularidad || 'Sin titularidad'}</span>
                      <span className="font-bold text-xl">{item._count._all}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Sin publicaciones por titularidad */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                  <Users className="w-6 h-6 text-gray-400" /> Sin publicaciones por titularidad
                </h3>
                <ul className="divide-y divide-gray-50 w-full">
                  {sinPublicacion.map((item) => (
                    <li key={item.titularidad} className="flex justify-between px-2 py-2 text-gray-900">
                      <span className="font-medium">{item.titularidad || 'Sin titularidad'}</span>
                      <span className="font-bold text-xl">{item._count._all}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Descarga Excel */}
            <div id="descarga" className="w-full max-w-3xl mt-6">
              <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
                Descargar Excel
              </h3>
              <ExcelDownloaderClient />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
