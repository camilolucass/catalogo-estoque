"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DashboardData } from "@/lib/domain";

const config = { total: { label: "Produtos", color: "var(--chart-1)" } } satisfies ChartConfig;

export function CategoryChart({ data }: { data: DashboardData["productsByCategory"] }) {
  return (
    <ChartContainer config={config} className="h-[260px] w-full" initialDimension={{ width: 420, height: 260 }}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
        <CartesianGrid horizontal={false} strokeDasharray="4 6" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={82} tick={{ fontSize: 11 }} />
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.35 }} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={[0, 7, 7, 0]} barSize={22} />
      </BarChart>
    </ChartContainer>
  );
}
