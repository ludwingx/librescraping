"use client";
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
  const [fecha, setFecha] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [titularidad, setTitularidad] = useState("");
  const [descargando, setDescargando] = useState(false);

  const handleDownload = async () => {
    setDescargando(true);
    const params = new URLSearchParams();
    if (fecha) params.append("fecha", fecha);
    if (ciudad) params.append("ciudad", ciudad);
    if (titularidad) params.append("titularidad", titularidad);
    const url = `/api/export-excel?${params.toString()}`;
    const res = await fetch(url);
    if (res.ok) {
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const hoy = new Date();
      let fechaParaNombre = fecha ? fecha : hoy.toISOString().slice(0, 10); 
      const parts = [fechaParaNombre];
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
        <label className="text-sm font-medium">Fecha</label>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border rounded px-2 py-1" />
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
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all duration-150 mt-4 md:mt-0"
      >
        {descargando ? "Descargando..." : "Descargar Excel"}
      </button>
    </div>
  );
}
