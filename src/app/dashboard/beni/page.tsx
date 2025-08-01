import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import prisma from "@/lib/prisma";

export default async function Page() {
  const posts = await prisma.face_scrap.findMany({
    where: {
      departamento: {
        equals: "BENI",
        mode: "insensitive",
      },
    },
    orderBy: { fechapublicacion: "desc" },
    take: 20,
  });

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
                  <BreadcrumbLink href="#">Beni</BreadcrumbLink>
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
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <h2 className="text-2xl font-bold mb-4">No hay datos para mostrar</h2>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <h2 className="text-2xl font-bold mb-4">Publicaciones de Beni</h2>
              {/* Aquí puedes renderizar la tabla de publicaciones como en dashboard */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
