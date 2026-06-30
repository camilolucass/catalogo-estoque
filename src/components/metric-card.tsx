import type { ComponentType } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  detail?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "warning" | "danger";
  trend?: "up" | "down";
}

export function MetricCard({ label, value, detail, icon: Icon, tone = "default", trend }: MetricCardProps) {
  return (
    <Card className="min-h-36 border bg-card shadow-sm">
      <CardContent className="flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className={cn("flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground", tone === "warning" && "border-amber-400/30 text-amber-400", tone === "danger" && "border-destructive/30 text-destructive")}><Icon className="size-4" /></span>
        </div>
        <div>
          <p className="metric-number text-3xl font-semibold">{value}</p>
          {detail && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {trend === "up" && <ArrowUpRight className="size-3.5 text-primary" />}
              {trend === "down" && <ArrowDownRight className="size-3.5 text-destructive" />}
              {detail}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
