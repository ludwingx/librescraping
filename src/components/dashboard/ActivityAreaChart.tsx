"use client";
import * as React from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface ActivityAreaChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  range?: number;
  setRange?: (r: number) => void;
  loading?: boolean;
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ActivityAreaChart({ data, color = "#2563eb", height = 260, range: rangeProp, setRange: setRangeProp, loading }: ActivityAreaChartProps) {
  // Permitir control externo o local
  const [rangeState, setRangeState] = React.useState<number>(7);
  const range = rangeProp !== undefined ? rangeProp : rangeState;
  const setRange = setRangeProp !== undefined ? setRangeProp : setRangeState;
  const chartConfig = {
    publicaciones: {
      label: "Publicaciones",
      color,
    },
  };
  // Mostrar sólo los últimos N días
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(-range);
  }, [data, range]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Actividad de publicaciones</CardTitle>
          <CardDescription>
            Total de publicaciones por día en el rango seleccionado
          </CardDescription>
        </div>
        <Select value={range.toString()} onValueChange={v => setRange(Number(v))}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Seleccionar rango">
            <SelectValue placeholder="Últimos 7 días" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7" className="rounded-lg">Últimos 7 días</SelectItem>
            <SelectItem value="14" className="rounded-lg">Últimos 14 días</SelectItem>
            <SelectItem value="30" className="rounded-lg">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill="url(#fillArea)"
            name="Publicaciones"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
    </CardContent>
    </Card>
  );
}
