"use client";
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Helpers para zona America/La_Paz (-04:00)
function ymdInLaPaz(date: Date) {
  const laPaz = new Date(date.getTime() - 4 * 60 * 60 * 1000);
  const y = laPaz.getUTCFullYear();
  const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
  const d = String(laPaz.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayLaPazYMD() {
  const now = new Date();
  const laPazNow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const laPazYesterday = new Date(laPazNow);
  laPazYesterday.setUTCDate(laPazNow.getUTCDate() - 1);
  return ymdInLaPaz(laPazYesterday);
}

function computeRange(range: "90d" | "30d" | "7d") {
  const end = getYesterdayLaPazYMD(); // hasta = ayer (La Paz)
  // Construimos fechas ancladas a -04:00 para restar días correctamente
  const endLaPaz = new Date(`${end}T00:00:00-04:00`);
  const startLaPaz = new Date(endLaPaz);
  const span = range === "7d" ? 6 : range === "30d" ? 29 : 89;
  startLaPaz.setUTCDate(endLaPaz.getUTCDate() - span);
  return {
    desde: ymdInLaPaz(startLaPaz),
    hasta: end,
  };
}

export function CandidateActivityOverview() {
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d");
  const initial = computeRange("90d");
  const [desde, setDesde] = React.useState<string>(initial.desde);
  const [hasta, setHasta] = React.useState<string>(initial.hasta);
  const [series, setSeries] = React.useState<Array<{ date: string; count: number }>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    const r = computeRange(timeRange);
    setDesde(r.desde);
    setHasta(r.hasta);
  }, [timeRange]);

  // Fetch real daily counts whenever desde/hasta changes
  React.useEffect(() => {
    if (!desde || !hasta) return;
    const controller = new AbortController();
    async function run() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/posts-daily?desde=${desde}&hasta=${hasta}`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Error ${res.status}`);
        }
        const body = await res.json();
        setSeries(Array.isArray(body.data) ? body.data : []);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Error al cargar datos");
        setSeries([]);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => controller.abort();
  }, [desde, hasta]);

  return (
    <div className="w-full mt-6">
      <Card className="@container/card">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-blue-700 font-bold text-lg">Resumen de actividad de Todos los Candidatos</CardTitle>
              <CardDescription>
                <span className="hidden @[540px]/card:inline">Total para el rango seleccionado</span>
                <span className="@[540px]/card:hidden">Rango seleccionado</span>
              </CardDescription>
              {desde && hasta && (
                <p className="text-xs text-muted-foreground mt-1">
                  Rango: {desde} <span className="mx-1">–</span> {hasta}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* ToggleGroup (desktop) */}
              <div className="hidden md:flex">
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v: string) => {
                    if (v) setTimeRange(v as "90d" | "30d" | "7d");
                  }}
                  variant="outline"
                  className="*:data-[slot=toggle-group-item]:px-4"
                >
                  <ToggleGroupItem
                    value="90d"
                    className="h-8 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:hover:bg-blue-700"
                  >
                    Últimos 3 meses
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="30d"
                    className="h-8 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:hover:bg-blue-700"
                  >
                    Últimos 30 días
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="7d"
                    className="h-8 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:hover:bg-blue-700"
                  >
                    Últimos 7 días
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              {/* Select (mobile) */}
              <div className="md:hidden">
                <Select value={timeRange} onValueChange={(v: "90d" | "30d" | "7d") => setTimeRange(v)}>
                  <SelectTrigger className="w-48" aria-label="Selecciona un rango">
                    <SelectValue placeholder="Selecciona un rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90d">Últimos 3 meses</SelectItem>
                    <SelectItem value="30d">Últimos 30 días</SelectItem>
                    <SelectItem value="7d">Últimos 7 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
         
          <div className="overflow-x-auto">
            <div className="overflow-hidden rounded-lg border">
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                    <defs>
                      <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}
                      tickFormatter={(value: string) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("es-BO", { month: "short", day: "numeric" });
                      }}
                    />
                    <Tooltip
                      cursor={{ stroke: "#94a3b8" }}
                      contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb" }}
                      labelFormatter={(value: string) => new Date(value).toLocaleDateString("es-BO", { month: "short", day: "numeric" })}
                      formatter={(val: any) => [val as number, "Publicaciones"]}
                    />
                    <Area type="monotone" dataKey="count" fill="url(#fillPosts)" stroke="#ef4444" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de gráfica de área simple sin dependencias
function ChartInline({ series }: { series: Array<{ date: string; count: number }> }) {
  if (!series || series.length === 0) return null;

  const values = series.map((s) => s.count);

  const width = 800; // ancho virtual
  const height = 220; // alto de la gráfica
  const padding = 24;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const maxVal = Math.max(1, ...values);

  const points = values.map((v, i) => {
    const x = padding + (innerW * i) / Math.max(1, values.length - 1);
    const y = padding + innerH - (v / maxVal) * innerH;
    return { x, y };
  });

  // Path para el área
  const areaPath = (() => {
    if (points.length === 0) return "";
    const top = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const last = points[points.length - 1];
    const first = points[0];
    return `${top} L${last.x},${padding + innerH} L${first.x},${padding + innerH} Z`;
  })();

  // Path para la línea
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[250px]">
          {/* Grid horizontal ligera */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = 24 + (innerH * (i + 1)) / 5;
            return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
          })}
          {/* Área */}
          <path d={areaPath} fill="#bfdbfe" fillOpacity={0.5} />
          {/* Línea */}
          <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}
