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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PostGeneral {
  candidatoid: string;
  nombrepagina: string;
  texto: string;
  perfil: string;
  posturl: string;
  titularidad?: string;
  departamento?: string;
  vistas?: number;
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
  const [openRows, setOpenRows] = useState<{ [key: string]: boolean }>({});
  // Filtros de fecha
  const [desde, setDesde] = useState(() => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  });
  const [hasta, setHasta] = useState(() => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  });
  const [allPosts, setAllPosts] = useState<PostGeneral[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // Obtener publicaciones generales como antes
        const resPosts = await fetch(`/api/general-posts?desde=${desde}&hasta=${hasta}`);
        const dataPosts = await resPosts.json();
        setAllPosts(dataPosts.allPosts || []);


      } catch (err) {
        console.error("[IGENERAL] Error en fetchPosts:", err);
        setAllPosts([]);
        ([]);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [desde, hasta]);

  const postsPorDepartamento: { [dep: string]: PostGeneral[] } = {};
  allPosts.forEach(post => {
    const dep = (post.departamento || "Sin departamento")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
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
              <img
                className="w-35 h-10 object-contain"
                src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FrFJtBVqs%2FProyecto-nuevo-3.png&w=256&q=75"
                alt="Libre-Scraping Logo 1"
                width={120}
                height={40}
              />
              <img
                className="w-22 h-10 object-contain"
                src="https://noticias-admin-panel.vercel.app/_next/image/?url=https%3A%2F%2Fi.postimg.cc%2FMZDMg3pY%2FProyecto-nuevo-1.png&w=128&q=75"
                alt="Libre-Scraping Logo 2"
                width={80}
                height={40}
              />
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
                perfil: post.perfil || "",
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
        {/* Mostrar PRESIDENTE y VICEPRESIDENTE */}
        {["PRESIDENTE", "VICEPRESIDENTE"].map(titularidad => {
          const rows = allPosts.filter(post => (post.titularidad || "").toUpperCase() === titularidad);
          const isOpen = openRows[titularidad] || false;
          const rowsToShow = isOpen ? rows : rows.slice(0, 5);
          return (
            <div key={titularidad} className="container mx-auto py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{titularidad}</h2>
                </div>
              </div>
              <div className="w-full overflow-x-auto p-2">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[700px] sm:min-w-[1050px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-1.5 py-1.5 min-w-[200px] w-[200px]">Nombre</TableHead>
                        <TableHead className="px-1.5 py-1.5 min-w-[260px] w-[260px]">Texto</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[60px] text-center">Me gusta</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[60px] text-center">Vistas</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">Comentarios</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">Compartidos</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[120px] hidden lg:table-cell">Red Social</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">Fecha y hora</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">Ver post</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rowsToShow.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            No hay publicaciones extraídas para este grupo
                          </TableCell>
                        </TableRow>
                      ) : (
                        rowsToShow.map((post: PostGeneral, idx: number) => (
                          <TableRow key={`${titularidad}-${post.candidatoid}-${idx}`}>
                            <TableCell className="px-1.5 py-1.5 w-[200px] max-w-[200px] truncate">
                              <div className="font-medium text-gray-900 text-xs">{post.perfil}</div>
                              <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                            </TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[260px] max-w-[260px] truncate" title={post.texto}>{post.texto?.slice(0, 50)}{post.texto?.length > 50 ? "..." : ""}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[60px] text-center">{post.likes}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[60px] text-center">{post.vistas ?? '-'}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">{post.comentarios}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">{post.compartidos}</TableCell>
                            <TableCell
                              className={`px-1.5 py-1.5 w-[120px] hidden lg:table-cell text-center font-bold 
    ${post.redsocial === 'Facebook' ? 'bg-blue-600 text-white' : ''}
    ${post.redsocial === 'Instagram' ? 'bg-pink-500 text-white' : ''}
    ${post.redsocial === 'TikTok' ? 'bg-black text-white' : ''}
  `}
                            >
                              {post.redsocial}
                            </TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">{post.fechapublicacion ? new Date(post.fechapublicacion).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' }) : ''}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">
                              <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {rows.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-2">
                            <button
                              className="text-blue-600 underline cursor-pointer"
                              onClick={() => setOpenRows(prev => ({ ...prev, [titularidad]: !isOpen }))}
                            >
                              {isOpen ? 'Ver menos' : `Ver más (${rows.length - 5})`}
                            </button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          );
        })}
        {/* Mostrar tablas por departamento */}
        {[
          "LA PAZ",
          "SANTA CRUZ",
          "COCHABAMBA",
          "ORURO",
          "POTOSI",
          "CHUQUISACA",
          "TARIJA",
          "BENI",
          "PANDO"
        ].map(dep => {
          const rows = (postsPorDepartamento[dep] || []).filter(post => (post.titularidad || "").toUpperCase() !== "PRESIDENTE" && (post.titularidad || "").toUpperCase() !== "VICEPRESIDENTE");
          const isOpen = openRows[dep] || false;
          const rowsToShow = isOpen ? rows : rows.slice(0, 5);
          return (
            <div key={dep} className="container mx-auto py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{dep}</h2>
                </div>
              </div>
              <div className="w-full overflow-x-auto p-2">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-[700px] sm:min-w-[1050px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-1.5 py-1.5 min-w-[200px] w-[200px]">Nombre</TableHead>
                        <TableHead className="px-1.5 py-1.5 min-w-[260px] w-[260px]">Texto</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[100px] text-center">Departamento</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[60px] text-center">Me gusta</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[60px] text-center">Vistas</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">Comentarios</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">Compartidos</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[120px] hidden lg:table-cell">Red Social</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">Fecha y hora</TableHead>
                        <TableHead className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">Ver post</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rowsToShow.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            No hay publicaciones extraídas para este departamento
                          </TableCell>
                        </TableRow>
                      ) : (
                        rowsToShow.map((post: PostGeneral, idx: number) => (
                          <TableRow key={`${dep}-${post.candidatoid}-${idx}`}>
                            <TableCell className="px-1.5 py-1.5 w-[200px] max-w-[200px] truncate">
                              <div className="font-medium text-gray-900 text-xs">{post.perfil}</div>
                              <a href={post.perfilurl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs">Perfil</a>
                            </TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[260px] max-w-[260px] truncate" title={post.texto}>{post.texto?.slice(0, 50)}{post.texto?.length > 50 ? "..." : ""}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[100px] text-center">{post.departamento}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[60px] text-center">{post.likes}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[60px] text-center">{post.vistas ?? '-'}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">{post.comentarios}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[70px] text-center hidden md:table-cell">{post.compartidos}</TableCell>
                            <TableCell
                              className={`px-1.5 py-1.5 w-[120px] hidden lg:table-cell text-center font-bold 
    ${post.redsocial === 'Facebook' ? 'bg-blue-600 text-white' : ''}
    ${post.redsocial === 'Instagram' ? 'bg-pink-500 text-white' : ''}
    ${post.redsocial === 'TikTok' ? 'bg-black text-white' : ''}
  `}
                            >
                              {post.redsocial}
                            </TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[170px] hidden lg:table-cell">{post.fechapublicacion ? new Date(post.fechapublicacion).toLocaleString('es-BO', { dateStyle: 'long', timeStyle: 'short' }) : ''}</TableCell>
                            <TableCell className="px-1.5 py-1.5 w-[90px] text-center hidden lg:table-cell">
                              <a href={post.posturl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver post</a>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {rows.length > 5 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-2">
                            <button
                              className="text-blue-600 underline cursor-pointer"
                              onClick={() => setOpenRows(prev => ({ ...prev, [dep]: !isOpen }))}
                            >
                              {isOpen ? 'Ver menos' : `Ver más (${rows.length - 5})`}
                            </button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </>
  );
}