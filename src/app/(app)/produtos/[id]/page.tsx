import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownToLine, ArrowLeft, ArrowLeftRight, ArrowUpFromLine, Boxes, CalendarClock, CircleDollarSign, FolderTree } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StockBadge } from "@/components/stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppError } from "@/lib/errors";
import { currencyFormatter, dateTimeFormatter } from "@/lib/format";
import { getProduct } from "@/lib/inventory-service";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data;
  try {
    data = await getProduct(id);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
  const { product, movements } = data;
  const summaries = [
    { label: "Saldo atual", value: `${product.stockQuantity} un.`, icon: Boxes },
    { label: "Preço unitário", value: currencyFormatter.format(product.price), icon: CircleDollarSign },
    { label: "Categoria", value: product.categoryName, icon: FolderTree },
    { label: "Movimentações", value: String(movements.length), icon: CalendarClock },
  ];

  return (
    <div className="space-y-7">
      <Button asChild variant="ghost" size="sm"><Link href="/produtos"><ArrowLeft />Voltar para produtos</Link></Button>
      <PageHeader title={product.name} description={product.description || "Produto sem descrição cadastrada."} action={<div className="flex items-center gap-2"><StockBadge product={product} />{product.isActive && <Button asChild><Link href={`/movimentacoes?productId=${product.id}`}><ArrowLeftRight />Movimentar</Link></Button>}</div>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map(({ label, value, icon: Icon }) => <Card key={label} className="border bg-card shadow-sm"><CardContent><div className="mb-5 flex size-9 items-center justify-center rounded-lg border bg-muted text-muted-foreground"><Icon className="size-4" /></div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="metric-number mt-2 text-2xl font-semibold">{value}</p></CardContent></Card>)}
      </section>
      <Card className="border bg-card shadow-sm">
        <CardHeader><CardTitle>Histórico completo</CardTitle></CardHeader>
        <CardContent className="px-0">
          <Table><TableHeader><TableRow><TableHead className="pl-4">Data</TableHead><TableHead>Tipo</TableHead><TableHead>Quantidade</TableHead><TableHead>Observação</TableHead><TableHead className="pr-4">Responsável</TableHead></TableRow></TableHeader><TableBody>
            {movements.map((movement) => <TableRow key={movement.id}><TableCell className="pl-4 text-muted-foreground">{dateTimeFormatter.format(new Date(movement.movementDate))}</TableCell><TableCell><Badge variant="outline" className={movement.type === "entrada" ? "border-primary/25 bg-primary/10 text-primary" : "border-orange-400/25 bg-orange-400/10 text-orange-700 dark:text-orange-300"}>{movement.type === "entrada" ? <ArrowDownToLine /> : <ArrowUpFromLine />}{movement.type}</Badge></TableCell><TableCell className="metric-number font-semibold">{movement.quantity}</TableCell><TableCell className="max-w-md truncate text-muted-foreground">{movement.observation || "—"}</TableCell><TableCell className="pr-4">{movement.userName}</TableCell></TableRow>)}
            {movements.length === 0 && <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground">Nenhuma movimentação registrada.</TableCell></TableRow>}
          </TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
