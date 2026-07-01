import { AlertTriangle, CheckCircle2, CircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/domain";
import { getStockStatus } from "@/lib/domain";

interface StockBadgeProps {
  product: Pick<Product, "stockQuantity" | "minimumStock">;
}

export function StockBadge({ product }: StockBadgeProps) {
  const status = getStockStatus(product);
  if (status === "out") {
    return <Badge variant="destructive" className="gap-1.5"><CircleOff />Sem estoque</Badge>;
  }
  if (status === "low") {
    return <Badge variant="outline" className="gap-1.5 border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-300"><AlertTriangle />Estoque baixo</Badge>;
  }
  return <Badge variant="outline" className="gap-1.5 border-primary/25 bg-primary/10 text-primary"><CheckCircle2 />Disponível</Badge>;
}
