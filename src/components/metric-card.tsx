import type { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "warning" | "danger";
  trend?: "up" | "down";
}

export function MetricCard({ label, value, detail, icon: Icon, tone = "default", trend }: MetricCardProps) {
  return (
    <Card className="relative min-h-36 overflow-hidden border-border/70 bg-card/78 panel-glow">
      <div className={cn("absolute inset-x-0 top-0 h-px bg-primary/50", tone === "warning" && "bg-amber-400/60", tone === "danger" && "bg-destructive/70")} />
      <CardContent className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <span className={cn("flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary", tone === "warning" && "border-amber-400/25 bg-amber-400/10 text-amber-300", tone === "danger" && "border-destructive/25 bg-destructive/10 text-destructive")}><Icon className="size-4" /></span>
        </div>
        <div>
          <p className="metric-number text-4xl font-semibold">{value}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend === "up" && <ArrowUpRight className="size-3.5 text-primary" />}
            {trend === "down" && <ArrowDownRight className="size-3.5 text-destructive" />}
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
