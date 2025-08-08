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
import { QuickActionCard } from "@/components/ui/quick-action-card";
import { BarChart3, Download, Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function Page() {
  // Obtener resumen de publicaciones por titularidad
  // Obtener la fecha de hoy en formato ISO (sin hora)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Obtener cantidad de los que no han publicado por titularidad
  const totalSinPublicar = await prisma.sin_publicacion.count({
    where: {
      fecha_scrap: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const posts = (
    await prisma.scrap_post.findMany({
      where: { redsocial: "Facebook" },
      orderBy: { fechapublicacion: "desc" },
      take: 20,
    })
  ).map((post) => ({
    ...post,
    created_at:
      post.created_at instanceof Date
        ? post.created_at.toISOString()
        : post.created_at,
  }));
  console.log(posts);
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
        <div className="container mx-auto py-8 max-w-7xl">
          <div className="flex flex-col items-center w-full">
            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
              {/* Total publicaciones hoy */}
              <Card className="border-blue-200 shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-blue-500" />{" "}
                    Publicaciones hoy
                  </CardTitle>
                  <CardDescription>
                    Total de publicaciones registradas hoy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-blue-700">
                    {posts.length}
                  </span>
                </CardContent>
              </Card>
              {/* Total sin publicar hoy */}
              <Card className="border-red-200 shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <Users className="w-6 h-6 text-red-500" /> Sin publicar hoy
                  </CardTitle>
                  <CardDescription>
                    Cuentas que no publicaron hoy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-4xl font-bold text-red-700">
                    {totalSinPublicar}
                  </span>
                </CardContent>
              </Card>
            </div>

            {/* Descarga Excel */}
            <Card className="w-full max-w-3xl mx-auto border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Download className="w-6 h-6 text-blue-500" /> Descargar Excel
                </CardTitle>
                <CardDescription>
                  Exporta los datos de publicaciones filtrando por fecha, ciudad
                  o titularidad. El archivo se descarga en formato Excel
                  (.xlsx).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExcelDownloadModal
                  posts={posts}
                  sinActividad={[]}
                  departamentoNombre={"General"}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
