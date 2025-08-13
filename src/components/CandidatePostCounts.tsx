"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface CandidateCountItem {
  id: number;
  nombre_completo: string;
  titularidad: string;
  departamento: string;
  total_posts: number;
  total_likes: number;
}

function getDefaultDate() {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  return ayer.toISOString().slice(0, 10);
}

export function CandidatePostCounts() {
  const [desde, setDesde] = React.useState<string>(() => getDefaultDate());
  const [hasta, setHasta] = React.useState<string>(() => getDefaultDate());
  const [titularidad, setTitularidad] = React.useState<string>("");
  const [departamento, setDepartamento] = React.useState<string>("");
  const [data, setData] = React.useState<CandidateCountItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  const titularidades = [
    "PRESIDENTE",
    "VICEPRESIDENTE",
    "SENADOR",
    "DIPUTADO PLURINOMINAL",
    "DIPUTADO UNINOMINAL URBANO",
    "DIPUTADO UNINOMINAL RURAL",
    "DIPUTADO SUPRAESTATAL",
    "DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL",
  ];
  const departamentos = [
    "SANTA CRUZ",
    "BENI",
    "PANDO",
    "COCHABAMBA",
    "CHUQUISACA",
    "TARIJA",
    "LA PAZ",
    "ORURO",
    "POTOSI",
  ];

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);
      if (titularidad) params.append("titularidad", titularidad);
      if (departamento) params.append("departamento", departamento);
      const res = await fetch(`/api/candidate-post-counts?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener datos");
      const json = await res.json();
      setData(json.data || []);
    } catch (e: any) {
      setError(e?.message || "Error desconocido");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, titularidad, departamento]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = React.useCallback(() => {
    const d = getDefaultDate();
    setDesde(d);
    setHasta(d);
    setTitularidad("");
    setDepartamento("");
    // fetchData será invocado por el useEffect cuando cambien los estados
  }, []);

  return (
    <Card className="w-full max-w-5xl mx-auto mt-6 border-blue-100">
      <CardHeader>
        <CardTitle className="text-blue-700">Actividad por candidato</CardTitle>
        <CardDescription>
          Visualiza la cantidad total de publicaciones por candidato en el rango seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Titularidad</label>
            <select
              className="border rounded px-2 py-1 min-w-[220px]"
              value={titularidad}
              onChange={(e) => setTitularidad(e.target.value)}
            >
              <option value="">Todas</option>
              {titularidades.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Departamento</label>
            <select
              className="border rounded px-2 py-1 min-w-[200px]"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
            >
              <option value="">Todos</option>
              {departamentos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Desde</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={desde}
              max={hasta}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Hasta</label>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={hasta}
              min={desde}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <button
            onClick={handleReset}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Limpiar filtro"}
          </button>
        </div>

        {error ? (
          <div className="text-red-600 text-sm mb-2">{error}</div>
        ) : null}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[260px]">Candidato</TableHead>
                <TableHead className="min-w-[160px]">Titularidad</TableHead>
                <TableHead className="min-w-[140px]">Departamento</TableHead>
                <TableHead className="text-right min-w-[120px]">Likes</TableHead>
                <TableHead className="text-right min-w-[120px]">Total posts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Cargando...</TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">Sin resultados</TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.nombre_completo}</TableCell>
                    <TableCell>{row.titularidad}</TableCell>
                    <TableCell>{row.departamento}</TableCell>
                    <TableCell className="text-right">{row.total_likes}</TableCell>
                    <TableCell className="text-right font-semibold">{row.total_posts}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
