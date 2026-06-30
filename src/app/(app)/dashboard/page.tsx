import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, FolderTree, PackageX } from "lucide-react";
import { CategoryChart } from "@/components/category-chart";
import { MetricCard } from "@/components/metric-card";
import { MovementChart } from "@/components/movement-chart";
import { PageHeader } from "@/components/page-header";
import { StockBadge } from "@/components/stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboard } from "@/lib/inventory-service";
import { dateTimeFormatter } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const data = await getDashboard();
  const { metrics } = data;
  return (
    <div className="space-y-7">
      <PageHeader title="Visão geral do estoque" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        <MetricCard label="Produtos ativos" value={metrics.totalProducts} detail={`${metrics.entriesThisMonth} unidades recebidas no mês`} icon={Boxes} trend="up" />
        <MetricCard label="Categorias" value={metrics.totalCategories} icon={FolderTree} />
        <MetricCard label="Estoque baixo" value={metrics.lowStockProducts} detail="Abaixo do mínimo" icon={AlertTriangle} tone="warning" />
        <MetricCard label="Sem estoque" value={metrics.outOfStockProducts} detail="Saldo zero" icon={PackageX} tone="danger" trend={metrics.outOfStockProducts > 0 ? "down" : undefined} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <Card className="border-border/70 bg-card/78 panel-glow">
          <CardHeader>
            <CardTitle>Fluxo de movimentações</CardTitle>
            <CardDescription>Volume de entradas e saídas nos últimos sete dias</CardDescription>
          </CardHeader>
          <CardContent><MovementChart data={data.movementTrend} /></CardContent>
        </Card>
        <Card className="border-border/70 bg-card/78 panel-glow">
          <CardHeader><CardTitle>Produtos por categoria</CardTitle></CardHeader>
          <CardContent><CategoryChart data={data.productsByCategory} /></CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="border-border/70 bg-card/78">
          <CardHeader><CardTitle>Movimentações recentes</CardTitle><CardAction><Button asChild variant="ghost" size="sm"><Link href="/movimentacoes">Ver histórico</Link></Button></CardAction></CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-4">Produto</TableHead><TableHead>Tipo</TableHead><TableHead>Quantidade</TableHead><TableHead className="hidden md:table-cell">Responsável</TableHead><TableHead className="pr-4 text-right">Data</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.recentMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="pl-4 font-medium">{movement.productName}</TableCell>
                    <TableCell><Badge variant="outline" className={movement.type === "entrada" ? "border-primary/25 bg-primary/10 text-primary" : "border-orange-400/25 bg-orange-400/10 text-orange-300"}>{movement.type === "entrada" ? <ArrowDownToLine /> : <ArrowUpFromLine />}{movement.type}</Badge></TableCell>
                    <TableCell className="metric-number font-medium">{movement.quantity}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{movement.userName}</TableCell>
                    <TableCell className="pr-4 text-right text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(movement.movementDate))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/78">
          <CardHeader><CardTitle>Produtos que exigem atenção</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.attentionProducts.length === 0 && <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Nenhum produto exige atenção.</p>}
              {data.attentionProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 rounded-xl border border-border/55 bg-background/25 p-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted metric-number font-semibold">{product.stockQuantity}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.name}</p><p className="text-xs text-muted-foreground">Mínimo: {product.minimumStock}</p></div>
                  <StockBadge product={product} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
