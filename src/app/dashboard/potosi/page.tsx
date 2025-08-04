import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import prisma from "@/lib/prisma";

export default async function Page() {
  const posts = await prisma.face_scrap.findMany({
    where: {
      departamento: {
        equals: "POTOSI",
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
                  <BreadcrumbLink href="#">Potosí</BreadcrumbLink>
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
              <h2 className="text-2xl font-bold mb-4">Publicaciones de Potosí</h2>
              <div className="overflow-x-auto p-4 bg-white rounded-lg shadow">
                <table className="min-w-full border border-gray-200 rounded-lg text-sm text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 w-14 text-center border">Foto</th>
                      <th className="px-4 py-2 min-w-[30px] border">Nombre</th>
                      <th className="px-4 py-2 min-w-[200px] border">Texto</th>
                      <th className="px-4 py-2 w-24 border">Titularidad</th>
                      <th className="px-4 py-2 w-24 border">Departamento</th>
                      <th className="px-4 py-2 w-20 text-center border">👍 Me gusta</th>
                      <th className="px-4 py-2 w-20 text-center border">💬 Comentarios</th>
                      <th className="px-4 py-2 w-20 text-center border">🔄 Compartidos</th>
                      <th className="px-4 py-2 w-14 text-center border">Miniatura</th>
                      <th className="px-4 py-2 w-24 border">Red Social</th>
                      <th className="px-4 py-2 w-28 border">Fecha y hora</th>
                      <th className="px-4 py-2 w-20 text-center border">Ver post</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post: any) => (
                      <tr key={post.postid} className="odd:bg-white even:bg-gray-50">
                        <td className="px-4 py-2 text-center border">
                          <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="font-medium text-gray-900 text-xs">{post.nombrepagina}</div>
                          <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                        </td>
                        <td className="px-4 py-2 border">{post.texto?.slice(0, 80)}{post.texto?.length > 80 ? '...' : ''}</td>
                        <td className="px-4 py-2 border">{post.titularidad || ""}</td>
                        <td className="px-4 py-2 border">{post.departamento || ""}</td>
                        <td className="px-4 py-2 text-center border">👍 {post.likes}</td>
                        <td className="px-4 py-2 text-center border">💬 {post.comentarios}</td>
                        <td className="px-4 py-2 text-center border">🔄 {post.compartidos}</td>
                        <td className="px-4 py-2 text-center border">
                          <img src={post.img} alt="miniatura" className="w-14 h-10 object-cover rounded" />
                        </td>
                        <td className="px-4 py-2 border">{post.redsocial}</td>
                        <td className="px-4 py-2 border">{post.fechapublicacion}</td>
                        <td className="px-4 py-2 text-center border">
                          <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
