import prisma from "@/lib/prisma";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default async function Page() {
  const posts = await prisma.face_scrap.findMany({
    orderBy: { fechapublicacion: "desc" },
    take: 20,
  });
  return (
    <div> 
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full gap-2 px-4">
            <div className="flex items-center gap-2 w-full">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Informe General</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-2 ml-auto pr-2">
                <img className="w-35 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" />
                <img className="w-22 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" />
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de Facebook</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">Descargar Boletín</Button>
            </div>
            <div className="overflow-x-auto rounded shadow bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 w-14 text-center">Foto</th>
                    <th className="px-1 py-2 min-w-[30px]">Nombre</th>
                    <th className="px-2 py-2 min-w-[200px]">Texto</th>
                    <th className="px-2 py-2 w-24">Titularidad</th>
                    <th className="px-2 py-2 w-24">Departamento</th>
                    <th className="px-2 py-2 w-20 text-center">👍 Me gusta</th>
                    <th className="px-2 py-2 w-20 text-center">💬 Comentarios</th>
                    <th className="px-2 py-2 w-20 text-center">🔄 Compartidos</th>
                    <th className="px-2 py-2 w-14 text-center">Miniatura</th>
                    <th className="px-2 py-2 w-24">Red Social</th>
                    <th className="px-2 py-2 w-28">Fecha y hora</th>
                    <th className="px-1 py-2 w-20 text-center">Ver post</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post: any) => (
                    <tr key={post.postid} className="odd:bg-white even:bg-gray-50">
                      <td className="px-2 py-2 text-center">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-1 py-2 max-w-[120px] truncate">
                        <div className="font-medium text-gray-900 text-xs">{post.nombrepagina}</div>
                        <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                      </td>
                      <td className="px-2 py-2 max-w-xs truncate" title={post.texto}>{post.texto.slice(0, 80)}{post.texto.length > 80 ? '...' : ''}</td>
                      <td className="px-2 py-2">{post.titularidad || ""}</td>
                      <td className="px-2 py-2">{post.departamento || ""}</td>
                      <td className="px-2 py-2 text-center">👍 {post.likes}</td>
                      <td className="px-2 py-2 text-center">💬 {post.comentarios}</td>
                      <td className="px-2 py-2 text-center">🔄 {post.compartidos}</td>
                      <td className="px-2 py-2 text-center">
                        <img src={post.img} alt="miniatura" className="w-14 h-10 object-cover rounded" />
                      </td>
                      <td className="px-2 py-2">{post.redsocial}</td>
                      <td className="px-2 py-2">{post.fechapublicacion}</td>
                      <td className="px-1 py-2 text-center">
                        <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}
