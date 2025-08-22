"use client";
import * as React from "react";
import { ActivityAreaChart, ActivityAreaChartData } from "@/components/dashboard/ActivityAreaChart";

// Helper para obtener fecha en La Paz (UTC-4)
function getLaPazDateString(d: Date) {
  const laPaz = new Date(d.getTime() - 4 * 60 * 60 * 1000);
  const y = laPaz.getUTCFullYear();
  const m = String(laPaz.getUTCMonth() + 1).padStart(2, "0");
  const day = String(laPaz.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


export function DashboardActivityAreaChart() {
  const [range, setRange] = React.useState<number>(7);
  const [data, setData] = React.useState<ActivityAreaChartData[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Calcular fechas
      const now = new Date();
      const laPazNow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      const laPazYesterday = new Date(laPazNow);
      laPazYesterday.setUTCDate(laPazNow.getUTCDate() - 1);
      const yStr = getLaPazDateString(laPazYesterday);
      const yEnd = new Date(`${yStr}T23:59:59.999-04:00`);
      const start = new Date(laPazYesterday);
      start.setUTCDate(laPazYesterday.getUTCDate() - (range - 1));
      // Fetch a un endpoint API REST (debes crear este endpoint en /api/activity-counts)
      const params = new URLSearchParams({ start: start.toISOString(), end: yEnd.toISOString() });
      const res = await fetch(`/api/activity-counts?${params}`);
      const json = await res.json();
      // Compatibilidad: si falta 'date', lo reconstruimos usando el año actual
      const today = new Date();
      const currentYear = today.getFullYear();
      const dataWithDate = (json.data as any[]).map((item: any) => {
        if (item.date) return item;
        // reconstruir date a partir de label MM-DD
        const [mm, dd] = item.label.split("-");
        return { ...item, date: `${currentYear}-${mm}-${dd}` };
      });
      setData(dataWithDate);
      setLoading(false);
    }
    fetchData();
  }, [range]);

  return (
    <ActivityAreaChart
      data={data}
      color="#2563eb"
      height={260}
      range={range}
      setRange={setRange}
      loading={loading}
    />
  );
}
