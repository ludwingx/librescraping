import prisma from "@/lib/prisma";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

interface PostGeneral {
  postid: string;
  nombrepagina: string;
  texto: string;
  posturl: string;
  titularidad?: string;
  departamento?: string;
  likes?: number;
  comentarios?: number;
  compartidos?: number;
  img?: string;
  fotoperfil?: string;
  perfilurl?: string;
  fechapublicacion?: string;
  redsocial?: string;
}

export default async function Page() {
  // Consultas a cada red social
  const facebookPosts = (await prisma.scrap_post.findMany({
    where: { redsocial: "Facebook" },
    orderBy: { fechapublicacion: "desc" },
    take: 40,
  })).map(post => ({ ...post, redsocial: "Facebook" }));

  const instagramPosts = (await prisma.scrap_post.findMany({
    where: { redsocial: "Instagram" },
    orderBy: { fechapublicacion: "desc" },
    take: 40,
  })).map(post => ({ ...post, redsocial: "Instagram" }));

  const tiktokPosts = (await prisma.scrap_post.findMany({
    where: { redsocial: "TikTok" },
    orderBy: { fechapublicacion: "desc" },
    take: 40,
  })).map(post => ({ ...post, redsocial: "TikTok" }));

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
        <div className="flex flex-1 flex-col gap-8 p-2 pt-0 max-w-screen-xl mx-auto">
          <div className="container mx-auto py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-3xl font-bold">Informe General: Publicaciones por Red Social</h1>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Descargar Boletín</Button>
            </div>
          </div>
          {/* Sección Tuto Quiroga */}
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de Tuto Quiroga</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
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
                    
                    <th className="px-2 py-2 w-24">Fecha</th>
                    <th className="px-2 py-2 w-24 text-center">Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {[...facebookPosts, ...instagramPosts, ...tiktokPosts].filter((post: { [key: string]: any }) => (post.nombrepagina || '').toLowerCase() === 'tuto quiroga').map((post: { [key: string]: any }) => (
                    <tr key={`tuto-${post.postid}-${post.redsocial}`} className="bg-white border-b">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap border">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-4 py-2 text-blue-600 underline border">
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

          {/* Sección Juan Pablo Velasco */}
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de Juan Pablo Velasco</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
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
                    
                    <th className="px-2 py-2 w-24">Fecha</th>
                    <th className="px-2 py-2 w-24 text-center">Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {[...facebookPosts, ...instagramPosts, ...tiktokPosts].filter((post: any) => (post.nombrepagina || '').toLowerCase() === 'juan pablo velasco').map((post: any) => (
                    <tr key={`jpvelasco-${post.postid}-${post.redsocial}`} className="bg-white border-b">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap border">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-4 py-2 text-blue-600 underline border">
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

          {/* Sección Facebook */}
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de Facebook</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
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
                    
                    <th className="px-2 py-2 w-24">Fecha</th>
                    <th className="px-2 py-2 w-24 text-center">Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {facebookPosts.map((post: PostGeneral, idx: number) => (
                    <tr key={`facebook-${post.postid}-Facebook-${idx}`} className="bg-white border-b">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap border">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-4 py-2 text-blue-600 underline border">
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

          {/* Sección Instagram */}
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de Instagram</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              {/* Botón eliminado, solo hay uno global arriba */}
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
                    
                    <th className="px-2 py-2 w-24">Fecha</th>
                    <th className="px-2 py-2 w-24 text-center">Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {instagramPosts.map((post: PostGeneral, idx: number) => (
                    <tr key={`instagram-${post.postid}-Instagram-${idx}`} className="bg-white border-b">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap border">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-4 py-2 text-blue-600 underline border">
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

          {/* Sección TikTok */}
          <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Publicaciones de TikTok</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              {/* Botón eliminado, solo hay uno global arriba */}
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
                    
                    <th className="px-2 py-2 w-24">Fecha</th>
                    <th className="px-2 py-2 w-24 text-center">Enlace</th>
                  </tr>
                </thead>
                <tbody>
                  {tiktokPosts.map((post: PostGeneral, idx: number) => (
                    <tr key={`tiktok-${post.postid}-TikTok-${idx}`} className="bg-white border-b">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap border">
                        <img src={post.fotoperfil} alt={post.nombrepagina} className="w-10 h-10 rounded-full mx-auto" />
                      </td>
                      <td className="px-4 py-2 text-blue-600 underline border">
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
        </div>
      </div>
  );
}
