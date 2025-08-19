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
  const [orden, setOrden] = useState<'departamento' | 'titularidad'>('departamento');

  // Orden personalizado de titularidad
  const titularidadOrden = [
    'PRESIDENTE',
    'VICEPRESIDENTE',
    'SENADOR',
    'DIPUTADO PLURINOMINAL',
    'DIPUTADO UNINOMINAL URBANO',
    'DIPUTADO UNINOMINAL RURAL',
    'DIPUTADO SUPRAESTATAL',
    'DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL',
    'OTRO'
  ];

  function ordenarCandidatos(data: Candidato[]): Candidato[] {
    if (orden === 'departamento') {
      return [...data].sort((a, b) => {
        // Primero, los departamentos que no son 'PAIS', luego 'PAIS'
        const depA = (a.departamento || '').toUpperCase() === 'PAIS' ? 1 : 0;
        const depB = (b.departamento || '').toUpperCase() === 'PAIS' ? 1 : 0;
        if (depA !== depB) return depA - depB;
        const cmpDep = (a.departamento || '').localeCompare(b.departamento || '');
        if (cmpDep !== 0) return cmpDep;
        // Dentro del departamento, titularidad personalizada
        const titA = titularidadOrden.indexOf((a.titularidad || '').toUpperCase());
        const titB = titularidadOrden.indexOf((b.titularidad || '').toUpperCase());
        return (titA === -1 ? 999 : titA) - (titB === -1 ? 999 : titB);
      });
    } else {
      // Ordenar por titularidad personalizada y luego por departamento
      return [...data].sort((a, b) => {
        const titA = titularidadOrden.indexOf((a.titularidad || '').toUpperCase());
        const titB = titularidadOrden.indexOf((b.titularidad || '').toUpperCase());
        if (titA !== titB) return (titA === -1 ? 999 : titA) - (titB === -1 ? 999 : titB);
        // Si misma titularidad, ordenar por departamento
        return (a.departamento || '').localeCompare(b.departamento || '');
      });
    }
  }

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
      <h1 className="text-2xl font-bold mb-2">Candidatos sin actividad</h1>
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
        <label htmlFor="orden" className="ml-4">Ordenar por:</label>
        <select
          id="orden"
          className="border rounded px-2 py-1"
          value={orden}
          onChange={e => setOrden(e.target.value as 'departamento' | 'titularidad')}
        >
          <option value="departamento">Departamento</option>
          <option value="titularidad">Titularidad</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full min-w-[320px] sm:min-w-[600px] border border-gray-200 rounded-lg bg-white text-xs">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="px-1 py-1 min-w-[120px] max-w-[180px] truncate">Nombre</TableHead>
              <TableHead className="px-1 py-1 min-w-[100px] max-w-[160px] truncate">Titularidad</TableHead>
              <TableHead className="px-1 py-1 min-w-[80px] max-w-[120px] truncate">Departamento</TableHead>
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
              ordenarCandidatos(candidatos).map((candidato: any) => (
                <TableRow key={candidato.id}>
                  <TableCell className="px-1 py-1 min-w-[120px] max-w-[180px] whitespace-normal break-words truncate" title={candidato.nombre_completo}>
                    {candidato.nombre_completo}
                  </TableCell>
                  <TableCell className="px-1 py-1 min-w-[100px] max-w-[160px] whitespace-normal break-words truncate" title={candidato.titularidad}>
                    {candidato.titularidad}
                  </TableCell>
                  <TableCell className="px-1 py-1 min-w-[80px] max-w-[120px] whitespace-normal break-words truncate" title={candidato.departamento}>
                    {candidato.departamento}
                  </TableCell>
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
