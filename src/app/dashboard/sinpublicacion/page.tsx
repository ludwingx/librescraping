"use client";
import React, { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface Candidato {
  id: number;
  nombre_completo: string;
  titularidad: string;
  departamento: string;
}

export default function SinPublicacionPage() {
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
  const [loading, setLoading] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/candidatos-sin-posts?desde=${desde}&hasta=${hasta}`)
      .then(res => res.json())
      .then(data => {
        setCandidatos(data.sinActividadRegistros || []);
        setLoading(false);
      })
      .catch(() => {
        setCandidatos([]);
        setLoading(false);
      });
  }, [desde, hasta]);

  return (
    <div>
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
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/sinpublicacion">Candidatos sin publicación
                   
                  </BreadcrumbLink>
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
      <div  className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-4 text-sm">
      <h1 className="text-2xl font-bold mb-2">Candidatos sin publicación</h1>
      <div className="flex gap-4 items-center mb-4">
        <label htmlFor="desde">Desde:</label>
        <input
          id="desde"
          type="date"
          className="border rounded px-2 py-1"
          value={desde}
          onChange={e => setDesde(e.target.value)}
        />
        <label htmlFor="hasta">Hasta:</label>
        <input
          id="hasta"
          type="date"
          className="border rounded px-2 py-1"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
        />
        <Button onClick={() => { setDesde(desde); setHasta(hasta); }}>Filtrar</Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Titularidad</TableHead>
              <TableHead>Departamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Cargando...</TableCell>
              </TableRow>
            ) : candidatos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Todos los candidatos han publicado en el rango seleccionado.</TableCell>
              </TableRow>
            ) : (
              candidatos
                .filter((candidato: any) => (candidato.publicaciones ?? 0) === 0)
                .map((candidato: any) => (
                  <TableRow key={candidato.id}>
                    <TableCell>{candidato.nombre_completo}</TableCell>
                    <TableCell>{candidato.titularidad}</TableCell>
                    <TableCell>{candidato.departamento}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>

    </div>
  );
}
