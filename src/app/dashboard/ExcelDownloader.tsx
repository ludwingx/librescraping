"use client";
import { Download } from "lucide-react";
import React, { useState } from "react";

const ciudades = [
  "LA PAZ", "SANTA CRUZ", "COCHABAMBA", "ORURO", "POTOSI", "CHUQUISACA", "TARIJA", "BENI", "PANDO"
];

const titularidades = [
  "PRESIDENTE",
  "VICEPRESIDENTE",
  "SENADOR",
  "DIPUTADO PLURINOMINAL",
  "DIPUTADO UNINOMINAL URBANO",
  "DIPUTADO UNINOMINAL RURAL",
  "DIPUTADO SUPRAESTATAL",
  "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL"
];


export default function ExcelDownloader() {
  // Fecha por defecto: ayer (zona local del navegador)
  const defaultDate = () => {
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);
    return ayer.toISOString().slice(0, 10);
  };
  const [desde, setDesde] = useState<string>(() => defaultDate());
  const [hasta, setHasta] = useState<string>(() => defaultDate());
  const [ciudad, setCiudad] = useState("");
  const [titularidad, setTitularidad] = useState("");
  const [descargando, setDescargando] = useState(false);

  const handleDownload = async () => {
    setDescargando(true);
    const params = new URLSearchParams();
    if (desde) params.append("desde", desde);
    if (hasta) params.append("hasta", hasta);
    if (ciudad) params.append("ciudad", ciudad);
    if (titularidad) params.append("titularidad", titularidad);
    const url = `/api/export-excel?${params.toString()}`;
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const parts: string[] = [];
      if (desde && hasta) {
        parts.push(`${desde}_a_${hasta}`);
      }
      if (ciudad) parts.push(ciudad.replace(/\s+/g, "_"));
      if (titularidad) parts.push(titularidad.replace(/\s+/g, "_"));
      const nombreArchivo = "reporte-" + parts.join("-") + ".xlsx";
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Error al descargar el archivo");
    }
    setDescargando(false);
  };

  return (
    
    <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center gap-4 mt-8 w-full max-w-4xl mx-auto">
      
      
      
      
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-sm font-medium">Desde</label>
        <input
          type="date"
          value={desde}
          max={hasta}
          onChange={e => setDesde(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-sm font-medium">Hasta</label>
        <input
          type="date"
          value={hasta}
          min={desde}
          onChange={e => setHasta(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-sm font-medium">Departamento</label>
        <select value={ciudad} onChange={e => setCiudad(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Todos</option>
          {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2 w-full md:w-auto">
        <label className="text-sm font-medium">Titularidad</label>
        <select value={titularidad} onChange={e => setTitularidad(e.target.value)} className="border rounded px-2 py-1">
          <option value="">Todas</option>
          {titularidades.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <button
        onClick={handleDownload}
        disabled={descargando}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all duration-150 mt-4 md:mt-0"
      >
        {descargando ? "Descargando..." : "Descargar Excel"} <Download />
      </button>
    </div>
  );
}
