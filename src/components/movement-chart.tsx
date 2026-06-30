"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DashboardData } from "@/lib/domain";

const config = {
  entradas: { label: "Entradas", color: "var(--chart-1)" },
  saidas: { label: "Saídas", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function MovementChart({ data }: { data: DashboardData["movementTrend"] }) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full" initialDimension={{ width: 700, height: 260 }}>
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 10 }}>
        <defs>
          <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-entradas)" stopOpacity={0.35} /><stop offset="95%" stopColor="var(--color-entradas)" stopOpacity={0} /></linearGradient>
          <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-saidas)" stopOpacity={0.25} /><stop offset="95%" stopColor="var(--color-saidas)" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 6" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area dataKey="entradas" type="monotone" fill="url(#fillEntradas)" stroke="var(--color-entradas)" strokeWidth={2.4} />
        <Area dataKey="saidas" type="monotone" fill="url(#fillSaidas)" stroke="var(--color-saidas)" strokeWidth={2.4} />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
