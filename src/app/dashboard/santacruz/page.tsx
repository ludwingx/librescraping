import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { BoletinDownloader } from "./BoletinDownloader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import prisma from "@/lib/prisma";
import Image from 'next/image';

interface PostGeneral {
  id: number;
  perfil: string;
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
  created_at?: string;
}

export default async function Page() {
  // Calcular rango de fechas para hoy
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Obtener todos los posts de Santa Cruz SOLO de hoy
  const allPosts = await prisma.scrap_post.findMany({
    where: {
      departamento: {
        equals: "SANTA CRUZ",
        mode: "insensitive"
      },
      created_at: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: { created_at: "desc" },
    take: 300,
  });

  // Obtener posts nacionales PRESIDENTE y VICEPRESIDENTE SOLO de hoy
  const postsNacionales = await prisma.scrap_post.findMany({
    where: {
      departamento: {
        equals: "PAIS",
        mode: "insensitive"
      },
      titularidad: {
        in: ["PRESIDENTE", "VICEPRESIDENTE"]
      },
      created_at: {
        gte: today,
        lt: tomorrow
      }
    },
    orderBy: { created_at: "desc" }
  });


  // Obtener lista de sin actividad en RRSS desde la tabla sin_publicacion
  const sinActividadRegistros = await prisma.sin_publicacion.findMany({
    where: {
      departamento: {
        equals: "SANTA CRUZ",
        mode: "insensitive"
      }
    },
    orderBy: { fecha_scrap: "desc" },
    take: 100,
  });
  const sinActividad = sinActividadRegistros.map(r => `${r.candidato} - ${r.titularidad} - ${r.departamento}`);


  const titularidades = [
    "PRESIDENTE",
    "VICEPRESIDENTE",
    "SENADOR",
    "DIPUTADO PLURINOMINAL",
    "DIPUTADO UNINOMINAL URBANO",
    "DIPUTADO UNINOMINAL RURAL",
    "DIPUTADO SUPRAESTATAL",
    "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
    "SIN ACTIVIDAD EN RRSS"
  ];

  console.log(allPosts);

  // Mapear los posts para asegurar que fechapublicacion sea string y creada a partir de created_at (Date)
const mapPostToGeneral = (post: any): PostGeneral => ({
  ...post,
  fechapublicacion: post.created_at instanceof Date ? post.created_at.toISOString() : post.created_at,
});

const allPostsGeneral = allPosts.map(mapPostToGeneral);
const postsNacionalesGeneral = postsNacionales.map(mapPostToGeneral);

const postsPorTitularidad = Object.fromEntries(
  titularidades.map(tit => {
    let posts = allPostsGeneral.filter(p => (p.titularidad || "").toUpperCase() === tit);
    // Concatenar todos los nacionales si corresponde
    if (tit === "PRESIDENTE" || tit === "VICEPRESIDENTE") {
      const nacionales = postsNacionalesGeneral.filter(
        p => (p.titularidad || "").toUpperCase() === tit
      );
      if (nacionales.length > 0) {
        // Evitar duplicados por id
        const idsNacionales = new Set(nacionales.map(n => n.id));
        posts = [...nacionales, ...posts.filter(p => !idsNacionales.has(p.id))];
      }
    }
    return [tit, posts];
  })
);

  return (
    <>
    
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between w-full gap-2 px-4">
          <div className="flex items-center gap-2 w-full">
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator/>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/santacruz">Santa Cruz</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-2 ml-auto pr-2">
                <Image className="w-35 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" width={120} height={40} />
                <Image className="w-22 h-10 object-contain" src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" width={80} height={40} />
              </div>
            </div>
          </div>
        </header>
        <div className="w-full max-w-screen-xl mx-auto px-2 py-8">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
            <h1 className="text-3xl font-bold">Publicaciones por Titularidad</h1>
            <BoletinDownloader posts={allPosts} titularidades={titularidades} sinActividad={sinActividadRegistros} />
          </div>
          <div className="flex flex-col gap-12">
          {titularidades.filter(tit => tit !== "SIN ACTIVIDAD EN RRSS").map((tit: string) => (
            <section key={tit} className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">{tit}</h2>
                <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              {postsPorTitularidad[tit].length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[30px]">
                  <h3 className="text-lg text-muted-foreground">No hay publicaciones extraídas para esta titularidad</h3>
                </div>
              ) : (
                <div className="w-full overflow-x-auto p-2">
                  <Table className="min-w-[1500px] border border-gray-200 rounded-lg bg-white text-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        
                        <TableHead className="px-1 py-2 min-w-[30px]">Nombre</TableHead>
                        <TableHead className="px-2 py-2 min-w-[200px]">Texto</TableHead>
                        <TableHead className="px-2 py-2 w-24">Titularidad</TableHead>
                        <TableHead className="px-2 py-2 w-24">Departamento</TableHead>
                        <TableHead className="px-2 py-2 w-20 text-center">&quot;Me gusta&quot;</TableHead>
                        <TableHead className="px-2 py-2 w-20 text-center">&quot;Comentarios&quot;</TableHead>
                        <TableHead className="px-2 py-2 w-20 text-center">&quot;Compartidos&quot;</TableHead>
                        
                        <TableHead className="px-2 py-2 w-24">Red Social</TableHead>
                        <TableHead className="px-2 py-2 w-28">Fecha y hora</TableHead>
                        <TableHead className="px-1 py-2 w-20 text-center">Ver post</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {postsPorTitularidad[tit].map((post: PostGeneral) => (
                        <TableRow key={post.id} className="odd:bg-white even:bg-gray-50">
                          
                          <TableCell className="px-1 py-2 max-w-[120px] truncate">
                            <div className="font-medium text-gray-900 text-xs">{post.perfil}</div>
                            <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                          </TableCell>
                          <TableCell className="px-2 py-2 max-w-xs truncate" title={post.texto}>{post.texto?.slice(0, 80)}{post.texto?.length > 80 ? '...' : ''}</TableCell>
                          <TableCell className="px-2 py-2">{post.titularidad || ""}</TableCell>
                          <TableCell className="px-2 py-2">{post.departamento || ""}</TableCell>
                          <TableCell className="px-2 py-2 text-center">{post.likes}</TableCell>
                          <TableCell className="px-2 py-2 text-center">{post.comentarios}</TableCell>
                          <TableCell className="px-2 py-2 text-center">{post.compartidos}</TableCell>
                          
                          <TableCell className="px-2 py-2">{post.redsocial}</TableCell>
                          <TableCell className="px-2 py-2">{post.fechapublicacion}</TableCell>
                          <TableCell className="px-1 py-2 text-center">
                            <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          ))}

          {/* Sección especial para Sin Actividad en RRSS */}
          <section key="sin-actividad" className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Sin Actividad en RRSS</h2>
              <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
            {sinActividadRegistros.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[100px]">
                <h3 className="text-lg text-muted-foreground">Todos tuvieron actividad en las últimas 24 horas</h3>
              </div>
            ) : (
              <div className="w-full overflow-x-auto p-2">
                <Table className="min-w-[700px] border border-gray-200 rounded-lg bg-white text-sm">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="px-2 py-2">Nombre</TableHead>
                      <TableHead className="px-2 py-2">Titularidad</TableHead>
                      <TableHead className="px-2 py-2">Departamento</TableHead>
                      <TableHead className="px-2 py-2">Red Social</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sinActividadRegistros.map((r) => (
                      <TableRow key={r.id} className="odd:bg-white even:bg-gray-50">
                        <TableCell className="px-2 py-2">{r.candidato}</TableCell>
                        <TableCell className="px-2 py-2">{r.titularidad}</TableCell>
                        <TableCell className="px-2 py-2">{r.departamento}</TableCell>
                        <TableCell className="px-2 py-2">{r.redsocial}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </div>

    </> 
  );

}

