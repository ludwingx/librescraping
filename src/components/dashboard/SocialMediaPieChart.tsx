'use client';

import { PieChart, Pie, Cell } from "recharts";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

interface SocialMediaData {
  platform: string;
  count: number;
}

interface SocialMediaPieChartProps {
  data: SocialMediaData[];
}

const COLORS = {
  'Facebook': 'hsl(221.2 83.2% 53.3%)',
  'Instagram': 'hsl(329.5 88.3% 60.6%)',
  'TikTok': 'hsl(0 0% 13.3%)'
};

export function SocialMediaPieChart({ data }: SocialMediaPieChartProps) {
  const chartConfig = {
    Facebook: { label: 'Facebook', color: COLORS.Facebook },
    Instagram: { label: 'Instagram', color: COLORS.Instagram },
    TikTok: { label: 'TikTok', color: COLORS.TikTok }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-center">Distribución por red social</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">Últimos 7 días </CardDescription>
        
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="w-full max-w-[320px] h-[300px]">
            <ChartContainer 
              config={chartConfig}
              className="[&_.recharts-pie-label-text]:fill-foreground w-full h-full"
            >
              <PieChart width={320} height={300} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie 
                  data={data} 
                  dataKey="count"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[entry.platform as keyof typeof COLORS]}
                    stroke="#fff"
                  />
                ))}
              </Pie>
            </PieChart>
            
          </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
