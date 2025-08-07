"use client";

import React, { useState, useEffect } from "react";
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
import Image from 'next/image';
import { SidebarTrigger } from "@/components/ui/sidebar";

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

export default function Page() {
  // Estado para fechas y datos
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [hasta, setHasta] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [allPosts, setAllPosts] = useState([]);
  const [postsNacionales, setPostsNacionales] = useState([]);
  interface SinActividadRegistro {
  id: number;
  candidato: string;
  titularidad: string;
  departamento: string;
  redsocial: string;
}
const [sinActividadRegistros, setSinActividadRegistros] = useState<SinActividadRegistro[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/santacruz-posts?desde=${desde}&hasta=${hasta}`);
        const data = await res.json();
        setAllPosts(data.allPosts || []);
        setPostsNacionales(data.postsNacionales || []);
        setSinActividadRegistros(data.sinActividadRegistros || []);
      } catch (err) {
        setAllPosts([]);
        setPostsNacionales([]);
        setSinActividadRegistros([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [desde, hasta]);



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

  // Mapear los posts para asegurar que fechapublicacion sea string
const mapPostToGeneral = (post: any): PostGeneral => ({
  ...post,
  fechapublicacion: post.fechapublicacion || '',
});

  const allPostsGeneral: PostGeneral[] = (allPosts as any[]).map(mapPostToGeneral);
  const postsNacionalesGeneral: PostGeneral[] = (postsNacionales as any[]).map(mapPostToGeneral);

  const postsPorTitularidad: Record<string, PostGeneral[]> = Object.fromEntries(
    titularidades.map((tit) => {
      let posts = allPostsGeneral.filter((p) => (p.titularidad || "").toUpperCase() === tit);
      // Concatenar todos los nacionales si corresponde
      if (tit === "PRESIDENTE" || tit === "VICEPRESIDENTE") {
        const nacionales = postsNacionalesGeneral.filter((p) => (p.titularidad || "").toUpperCase() === tit);
        if (nacionales.length > 0) {
          const idsNacionales = new Set(nacionales.map((n) => n.id));
          posts = [...nacionales, ...posts.filter((p) => !idsNacionales.has(p.id))];
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
            <SidebarTrigger className="-ml-1" />
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
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-4 text-sm">
  {/* Responsive helper: reduce padding en móvil */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
  <h1 className="text-2xl sm:text-2xl font-bold">Publicaciones por Titularidad - Santa Cruz</h1>
  
</div>
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 w-full">
  {/* En móvil, el botón va debajo de los filtros */}
  
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto flex-1">
  <h1 className="text-sm font-bold">Filtrar por fecha:</h1> 
    <label htmlFor="desde" className="font-medium">Desde:</label>
    <input
      id="desde"
      type="date"
      className="border rounded px-2 py-1"
      value={desde}
      onChange={e => setDesde(e.target.value)}
      max={hasta}
    />
    <label htmlFor="hasta" className="font-medium ml-4">Hasta:</label>
    <input
      id="hasta"
      type="date"
      className="border rounded px-2 py-1"
      value={hasta}
      onChange={e => setHasta(e.target.value)}
      min={desde}
    />{loading && <span className="text-blue-600">Cargando datos...</span>}
  </div>
  <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
    <BoletinDownloader posts={[...allPosts, ...postsNacionales]} titularidades={titularidades} sinActividad={sinActividadRegistros} />
  </div>
</div>


          <div className="flex flex-col gap-12">
          {titularidades.filter(tit => tit !== "SIN ACTIVIDAD EN RRSS").map((tit: string) => (
            <section key={tit}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-base sm:text-lg font-bold">{tit}</h2>
              </div>
              {postsPorTitularidad[tit].length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[30px]">
                  <h3 className="text-lg text-muted-foreground">No hay publicaciones extraídas para esta titularidad</h3>
                </div>
              ) : (
                <div className="w-full overflow-x-auto p-2">
                  <div className="overflow-x-auto">
  <Table className="w-full min-w-[500px] sm:min-w-[900px] border border-gray-200 rounded-lg bg-white text-xs">

                    <TableHeader>
  <TableRow className="bg-gray-100">
    <TableHead className="px-1 py-1 min-w-[30px]">Nombre</TableHead>
    <TableHead className="px-1 py-1 min-w-[120px]">Texto</TableHead>
    <TableHead className="px-1 py-1 w-16 text-center">Me gusta</TableHead>
    {/* Oculta columnas menos críticas en móvil */}
    <TableHead className="px-1 py-1 w-16 text-center hidden md:table-cell">Comentarios</TableHead>
    <TableHead className="px-1 py-1 w-16 text-center hidden md:table-cell">Compartidos</TableHead>
    <TableHead className="px-1 py-1 w-20 hidden lg:table-cell">Red Social</TableHead>
    <TableHead className="px-1 py-1 w-24 hidden lg:table-cell">Fecha y hora</TableHead>
    <TableHead className="px-1 py-1 w-14 text-center hidden lg:table-cell">Ver post</TableHead>
  </TableRow>
</TableHeader>
                    <TableBody>
                      {postsPorTitularidad[tit].map((post: PostGeneral) => (
  <TableRow key={post.id} className="odd:bg-white even:bg-gray-50">
    <TableCell className="px-1 py-1 max-w-[100px] truncate">
      <div className="font-medium text-gray-900 text-xs">{post.perfil}</div>
      <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
    </TableCell>
    <TableCell className="px-1 py-1 max-w-[120px] truncate" title={post.texto}>{post.texto?.slice(0, 50)}{post.texto?.length > 50 ? '...' : ''}</TableCell>
    <TableCell className="px-1 py-1 text-center">{post.likes}</TableCell>
    {/* Oculta columnas menos críticas en móvil */}
    <TableCell className="px-1 py-1 text-center hidden md:table-cell">{post.comentarios}</TableCell>
    <TableCell className="px-1 py-1 text-center hidden md:table-cell">{post.compartidos}</TableCell>
    <TableCell className="px-1 py-1 hidden lg:table-cell">{post.redsocial}</TableCell>
    <TableCell className="px-1 py-1 hidden lg:table-cell">{
      (() => {
        const raw = post.fechapublicacion;
        if (!raw) return "";
        // Intentar parsear a Date si es posible
        const parsed = new Date(raw.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'));
        if (!isNaN(parsed.getTime())) {
          // Mostrar como dd/MM/yyyy HH:mm
          const dd = String(parsed.getDate()).padStart(2, '0');
          const mm = String(parsed.getMonth() + 1).padStart(2, '0');
          const yyyy = parsed.getFullYear();
          const hh = String(parsed.getHours()).padStart(2, '0');
          const min = String(parsed.getMinutes()).padStart(2, '0');
          return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
        }
        // Si no es parseable, mostrar el string original
        return raw;
      })()
    }</TableCell>
    <TableCell className="px-1 py-1 text-center hidden lg:table-cell">
      <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
    </TableCell>
  </TableRow>
))}
                    </TableBody>
                  </Table>
</div>
                </div>
              )}
            </section>
          ))}

          {/* Sección especial para Sin Actividad en RRSS */}
          <section key="sin-actividad" className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-base sm:text-lg font-bold">Sin Actividad en RRSS</h2>
              <span className="text-muted-foreground text-sm font-medium">{new Date().toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
            {sinActividadRegistros.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[100px]">
                <h3 className="text-lg text-muted-foreground">Todos tuvieron actividad en las últimas 24 horas</h3>
              </div>
            ) : (
              <div className="w-full overflow-x-auto p-2">
                <div className="overflow-x-auto">
  <Table className="w-full min-w-[300px] sm:min-w-[700px] border border-gray-200 rounded-lg bg-white text-xs">

                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="px-1 py-1">Nombre</TableHead>
                      <TableHead className="px-1 py-1">Red Social</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sinActividadRegistros.map((r: SinActividadRegistro) => (
                      <TableRow key={r.id} className="odd:bg-white even:bg-gray-50">
                        <TableCell className="px-1 py-1">{r.candidato}</TableCell>
                        <TableCell className="px-1 py-1">{r.redsocial}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
</div>
              </div>
            )}
          </section>
        </div>
      </div>

    </> 
  );

}

