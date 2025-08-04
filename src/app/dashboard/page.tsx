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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="container mx-auto py-8">
            <div className="flex flex-col items-center justify-center min-h-[300px] w-full">
              <h2 className="text-3xl font-extrabold mb-2 text-blue-700">Dashboard</h2>
              <p className="text-muted-foreground text-base mb-6">Bienvenido al dashboard de Libre Scraping.</p>

              <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center">
                {/* Resumen de publicaciones */}
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 17l4 4 4-4m-4-5v9"/><path d="M20 12a8 8 0 10-16 0 8 8 0 0016 0z"/></svg>
                    Publicaciones por titularidad
                  </h3>
                  <ul className="divide-y divide-blue-100">
                    {resumen.map((item) => (
                      <li key={item.titularidad} className="flex justify-between px-2 py-2 text-blue-900">
                        <span className="font-medium">{item.titularidad || 'Sin titularidad'}</span>
                        <span className="font-bold text-lg">{item._count._all}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Sin publicaciones */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    Sin publicaciones por titularidad
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {sinPublicacion.map((item) => (
                      <li key={item.titularidad} className="flex justify-between px-2 py-2 text-gray-900">
                        <span className="font-medium">{item.titularidad || 'Sin titularidad'}</span>
                        <span className="font-bold text-lg">{item._count._all}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navegación rápida */}
              <div className="flex flex-wrap gap-4 mt-10 justify-center w-full max-w-4xl">
                <a href="/dashboard/santacruz" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-150 flex items-center gap-2">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
                  Publicaciones de Santa Cruz
                </a>
                <a href="/dashboard/igeneral" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all duration-150 flex items-center gap-2">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8m-4-4v8"/></svg>
                  General RRSS
                </a>
              </div>

              {/* Descarga Excel */}
              {/* El botón de descarga se mueve a un Client Component separado */}
              <ExcelDownloaderClient />
            </div>
          </div>
        </div>
    
     </>
  )
}
