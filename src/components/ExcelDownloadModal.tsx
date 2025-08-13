"use client";
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { BoletinDownloader } from "@/components/BoletinDownloader";

import type { Post } from "@/types/Post";

interface SinActividadItem {
  candidato: string;
  titularidad: string;
  departamento: string;
  redsocial: string;
}

const titularidades = [
  "PRESIDENTE",
  "VICEPRESIDENTE",
  "SENADOR",
  "DIPUTADO PLURINOMINAL",
  "DIPUTADO UNINOMINAL URBANO",
  "DIPUTADO UNINOMINAL RURAL",
  "DIPUTADO SUPRAESTATAL",
  "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
  "SIN ACTIVIDAD EN RRSS",
];

interface ExcelDownloadModalProps {
  posts: Post[];
  sinActividad?: SinActividadItem[];
  departamentoNombre: string;
}

export const ExcelDownloadModal: React.FC<ExcelDownloadModalProps> = ({ posts, sinActividad = [], departamentoNombre }) => {
  // Fecha por defecto: ayer (zona local del navegador)
  const defaultDate = () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  };
  const [startDate, setStartDate] = useState<string>(() => defaultDate());
  const [endDate, setEndDate] = useState<string>(() => defaultDate());
  const [selectedTitularidad, setSelectedTitularidad] = useState("");
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [descargando, setDescargando] = useState(false);

  // Obtener departamentos únicos de los posts
  const departamentos = [
  "LA PAZ",
  "SANTA CRUZ",
  "COCHABAMBA",
  "ORURO",
  "POTOSI",
  "CHUQUISACA",
  "TARIJA",
  "BENI",
  "PANDO"
];

  // Filtrar posts según los filtros
  const filteredPosts = posts.filter(post => {
    // Filtrar por titularidad
    if (selectedTitularidad && post.titularidad !== selectedTitularidad) return false;
    // Filtrar por departamento
    if (selectedDepartamento && post.departamento !== selectedDepartamento) return false;
    // Filtrar por fechas
    if (startDate && (!post.fechapublicacion || post.fechapublicacion < startDate)) return false;
    if (endDate && (!post.fechapublicacion || post.fechapublicacion > endDate)) return false;
    return true;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">Descargar Excel</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Descargar Excel</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="font-medium block">Titularidad</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedTitularidad}
              onChange={e => setSelectedTitularidad(e.target.value)}
            >
              <option value="">Todas</option>
              {titularidades.map((tit: string) => (
                <option key={tit} value={tit}>{tit}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-medium block">Departamento</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedDepartamento}
              onChange={e => setSelectedDepartamento(e.target.value)}
            >
              <option value="">Todos</option>
              {departamentos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-medium block">Desde</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="date"
                value={startDate}
                max={endDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="font-medium block">Hasta</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="date"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            onClick={async () => {
              setDescargando(true);
              const params = new URLSearchParams();
              if (startDate) params.append("desde", startDate);
              if (endDate) params.append("hasta", endDate);
              if (selectedDepartamento) params.append("ciudad", selectedDepartamento);
              if (selectedTitularidad) params.append("titularidad", selectedTitularidad);
              const url = `/api/export-excel?${params.toString()}`;
              const res = await fetch(url);
              if (res.ok) {
                const blob = await res.blob();
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                const hoy = new Date();
                let fechaParaNombre = startDate ? startDate : hoy.toISOString().slice(0, 10);
                let fechaFinNombre = endDate && endDate !== startDate ? `_${endDate}` : "";
                const parts = [fechaParaNombre + fechaFinNombre];
                if (selectedDepartamento) parts.push(selectedDepartamento.replace(/\s+/g, "_"));
                if (selectedTitularidad) parts.push(selectedTitularidad.replace(/\s+/g, "_"));
                const nombreArchivo = "reporte-" + parts.join("-") + ".xlsx";
                link.download = nombreArchivo;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else {
                alert("Error al descargar el archivo");
              }
              setDescargando(false);
            }}
            disabled={descargando}
          >
            {descargando ? "Descargando..." : "Descargar Excel"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="p-2">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
