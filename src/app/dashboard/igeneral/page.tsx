"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { BoletinDownloader } from "@/components/BoletinDownloader";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ExcelDownloadModal } from "@/components/ExcelDownloadModal";

interface PostGeneral {
  candidatoid: string;
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

export default function Page() {
  // Estado para controlar qué departamentos están expandidos
  const [openRows, setOpenRows] = useState<{[key:string]: boolean}>({});
  // Filtros de fecha
  const [desde, setDesde] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [hasta, setHasta] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [allPosts, setAllPosts] = useState<PostGeneral[]>([]);
  const [sinActividadRegistros, setSinActividadRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/general-posts?desde=${desde}&hasta=${hasta}`);
        const data = await res.json();
        console.log("[IGENERAL] Respuesta del backend:", data);
        setAllPosts(data.allPosts || []);
        setSinActividadRegistros(data.sinActividadRegistros || []);
      } catch (err) {
        console.error("[IGENERAL] Error en fetchPosts:", err);
        setAllPosts([]);
        setSinActividadRegistros([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [desde, hasta]);

  // Agrupar por departamento
  const postsPorDepartamento: { [dep: string]: PostGeneral[] } = {};
  allPosts.forEach(post => {
    // Normaliza el nombre del departamento para que coincida con la lista de tabs
    const dep = (post.departamento || "Sin departamento")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes
    if (!postsPorDepartamento[dep]) postsPorDepartamento[dep] = [];
    postsPorDepartamento[dep].push(post);
  });
  console.log("[IGENERAL] allPosts:", allPosts);
  console.log("[IGENERAL] postsPorDepartamento:", postsPorDepartamento);

  return (
    <>
   <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center justify-between w-full gap-2 px-4">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="-ml-1" />

            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Informe General</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex items-center gap-2 ml-auto pr-2">
              <img src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75" alt="Libre-Scraping Logo 1" width={40} height={40} className="w-10 h-10 object-contain" />
              <img src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75" alt="Libre-Scraping Logo 2" width={40} height={40} className="w-10 h-10 object-contain" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-8 p-2 pt-0 max-w-screen-xl mx-auto">
        <div className="container mx-auto py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold">Informe General: Publicaciones por Departamento</h1>
            <ExcelDownloadModal
              posts={allPosts.map(post => ({
                perfil: post.nombrepagina || "",
                nombrepagina: post.nombrepagina,
                texto: post.texto,
                posturl: post.posturl,
                titularidad: post.titularidad,
                fechapublicacion: post.fechapublicacion,
                redsocial: post.redsocial,
                departamento: post.departamento,
                likes: post.likes,
                comentarios: post.comentarios,
                compartidos: post.compartidos,
                img: post.img,
                fotoperfil: post.fotoperfil,
                perfilurl: post.perfilurl,
              }))}
              sinActividad={sinActividadRegistros}
              departamentoNombre={"INFORME GENERAL"}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <label htmlFor="desde" className="font-medium">Desde:</label>
            <input
              id="desde"
              type="date"
              className="border rounded px-2 py-1"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              max={hasta}
            />
            <label htmlFor="hasta" className="font-medium ml-2">Hasta:</label>
            <input
              id="hasta"
              type="date"
              className="border rounded px-2 py-1"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              min={desde}
            />
            {loading && <span className="text-blue-600 ml-4">Cargando datos...</span>}
          </div>
        </div>
        {/* Render ordenado: PAIS, 9 departamentos, luego Sin Actividad */}
        {[
          "PAIS",
          "LA PAZ",
          "SANTA CRUZ",
          "COCHABAMBA",
          "ORURO",
          "POTOSI",
          "CHUQUISACA",
          "TARIJA",
          "BENI",
          "PANDO"
        ].map(dep => (
          <div key={dep} className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{dep}</h2>
              </div>
            </div>
            <div className="w-full overflow-x-auto p-2">
              <div className="overflow-x-auto">
                <Table className="w-full min-w-[700px] sm:min-w-[1050px] border border-gray-200 rounded-lg bg-white text-xs">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="px-1.5 py-1.5 min-w-[120px] w-[120px]">Nombre</TableHead>
                      <TableHead className="px-1.5 py-1.5 min-w-[260px] w-[260px]">Texto</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[100px] text-center">Departamento</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[80px] text-center">Me gusta</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[105px] text-center hidden md:table-cell">Comentarios</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[105px] text-center hidden md:table-cell">Compartidos</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[120px] hidden lg:table-cell">Red Social</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">Fecha y hora</TableHead>
                      <TableHead className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">Ver post</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(postsPorDepartamento[dep] || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No hay publicaciones extraídas para este grupo
                        </TableCell>
                      </TableRow>
                    ) : (
                      (() => {
                        const rows = postsPorDepartamento[dep] || [];
                        const isOpen = openRows[dep] || false;
                        const rowsToShow = isOpen ? rows : rows.slice(0, 5);
                        return <>
                          {rowsToShow.map((post: PostGeneral, idx: number) => (
                            <TableRow key={`${dep}-${post.candidatoid}-${idx}`} className="odd:bg-white even:bg-gray-50">
                              <TableCell className="px-1.5 py-1.5 w-[120px] max-w-[120px] truncate">
                                <div className="font-medium text-gray-900 text-xs">{post.nombrepagina}</div>
                                <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                              </TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[260px] max-w-[260px] truncate" title={post.texto}>{post.texto?.slice(0, 50)}{post.texto?.length > 50 ? "..." : ""}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[100px] text-center">{post.departamento}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[80px] text-center">{post.likes}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[105px] text-center hidden md:table-cell">{post.comentarios}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[105px] text-center hidden md:table-cell">{post.compartidos}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[120px] hidden lg:table-cell">{post.redsocial}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">{post.fechapublicacion ? new Date(post.fechapublicacion).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' }) : ''}</TableCell>
                              <TableCell className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">
                                <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                              </TableCell>
                            </TableRow>
                          ))}
                          {rows.length > 5 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-2">
                                <button
                                  className="text-blue-600 underline cursor-pointer"
                                  onClick={() => setOpenRows(prev => ({ ...prev, [dep]: !isOpen }))}
                                >
                                  {isOpen ? 'Ver menos' : `Ver más (${rows.length - 5})`}
                                </button>
                              </TableCell>
                            </TableRow>
                          )}
                        </>;
                      })()
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ))}
        {/* Tabla de usuarios sin actividad RRSS */}
        <div className="container mx-auto py-8">
          <h2 className="text-xl font-bold mb-2">Usuarios sin actividad en RRSS</h2>
          <div className="overflow-x-auto rounded shadow bg-white">
            <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2">Candidato</th>
                  <th className="px-2 py-2">Titularidad</th>
                  <th className="px-2 py-2">Departamento</th>
                  <th className="px-2 py-2">Red Social</th>
                  <th className="px-2 py-2">Fecha Scrap</th>
                </tr>
              </thead>
              <tbody style={{ minHeight: '300px' }}>
                {sinActividadRegistros.map((reg, idx) => (
                  <tr key={idx} className="bg-white border-b">
                    <td className="px-2 py-2 border">{reg.candidato}</td>
                    <td className="px-2 py-2 border">{reg.titularidad}</td>
                    <td className="px-2 py-2 border">{reg.departamento}</td>
                    <td className="px-2 py-2 border">{reg.redsocial}</td>
                    <td className="px-2 py-2 border">{reg.fecha_scrap ? new Date(reg.fecha_scrap).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}