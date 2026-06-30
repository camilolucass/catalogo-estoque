"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Info, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Product, StockMovement } from "@/lib/domain";
import { dateTimeFormatter } from "@/lib/format";

interface MovementManagerProps {
  products: Product[];
  movements: StockMovement[];
  selectedProductId?: string;
}

function localDateTimeValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

async function responseMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || "Não foi possível registrar a movimentação.";
}

export function MovementManager({ products, movements, selectedProductId }: MovementManagerProps) {
  const router = useRouter();
  const activeProducts = products.filter((product) => product.isActive);
  const initialProduct = activeProducts.some((product) => product.id === selectedProductId) ? selectedProductId! : activeProducts[0]?.id || "";
  const [formProductId, setFormProductId] = useState(initialProduct);
  const [formType, setFormType] = useState<"entrada" | "saida">("entrada");
  const [filterProduct, setFilterProduct] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const selectedProduct = activeProducts.find((product) => product.id === formProductId);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return movements.filter((movement) => {
      if (filterProduct !== "all" && movement.productId !== filterProduct) return false;
      if (filterType !== "all" && movement.type !== filterType) return false;
      if (query && !`${movement.productName} ${movement.observation || ""}`.toLocaleLowerCase("pt-BR").includes(query)) return false;
      return true;
    });
  }, [filterProduct, filterType, movements, search]);

  const totals = movements.reduce((summary, movement) => {
    summary[movement.type] += movement.quantity;
    return summary;
  }, { entrada: 0, saida: 0 });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    try {
      const form = new FormData(formElement);
      const response = await fetch("/api/stock-movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: form.get("productId"),
          type: form.get("type"),
          quantity: form.get("quantity"),
          movementDate: form.get("movementDate"),
          observation: form.get("observation"),
        }),
      });
      if (!response.ok) return toast.error(await responseMessage(response));
      toast.success(formType === "entrada" ? "Entrada registrada e saldo atualizado." : "Saída registrada e saldo atualizado.");
      formElement.reset();
      setFormProductId(initialProduct);
      setFormType("entrada");
      router.refresh();
    } catch {
      toast.error("Não foi possível registrar a movimentação.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border bg-card shadow-sm">
          <CardHeader><CardTitle>Registrar movimentação</CardTitle><CardDescription>O saldo é atualizado automaticamente.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label>Produto</Label><Select name="productId" value={formProductId} onValueChange={setFormProductId} required><SelectTrigger className="w-full"><SelectValue placeholder="Selecione um produto" /></SelectTrigger><SelectContent>{activeProducts.map((product) => <SelectItem key={product.id} value={product.id}>{product.name} · {product.stockQuantity} un.</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Tipo</Label><Select name="type" value={formType} onValueChange={(value) => setFormType(value as "entrada" | "saida")}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="movement-quantity">Quantidade</Label><Input id="movement-quantity" name="quantity" type="number" min="1" step="1" max={formType === "saida" ? selectedProduct?.stockQuantity : undefined} placeholder="0" required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="movement-date">Data e hora</Label><Input id="movement-date" name="movementDate" type="datetime-local" defaultValue={localDateTimeValue()} required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="movement-observation">Observação</Label><Textarea id="movement-observation" name="observation" placeholder="Motivo, destino ou referência da operação" maxLength={500} /></div>
              <Alert className="sm:col-span-2"><Info /><AlertTitle>Saldo disponível: {selectedProduct?.stockQuantity ?? 0} unidades</AlertTitle><AlertDescription>{formType === "saida" ? "Saídas acima deste saldo serão bloqueadas, mesmo se a requisição for alterada no navegador." : "A entrada será adicionada ao saldo atual e registrada no histórico."}</AlertDescription></Alert>
              <Button type="submit" size="lg" className="sm:col-span-2" disabled={pending || activeProducts.length === 0}>{pending ? <LoaderCircle className="animate-spin" /> : formType === "entrada" ? <ArrowDownToLine /> : <ArrowUpFromLine />}{pending ? "Processando..." : `Registrar ${formType}`}</Button>
            </form>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Card className="border bg-card shadow-sm"><CardContent><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Entradas registradas</p><p className="metric-number mt-3 text-3xl font-semibold">{totals.entrada}</p><p className="mt-1 text-xs text-muted-foreground">unidades no histórico</p></div><span className="flex size-10 items-center justify-center rounded-lg border bg-muted text-primary"><ArrowDownToLine className="size-4" /></span></div></CardContent></Card>
          <Card className="border bg-card shadow-sm"><CardContent><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Saídas registradas</p><p className="metric-number mt-3 text-3xl font-semibold">{totals.saida}</p><p className="mt-1 text-xs text-muted-foreground">unidades no histórico</p></div><span className="flex size-10 items-center justify-center rounded-lg border bg-muted text-orange-300"><ArrowUpFromLine className="size-4" /></span></div></CardContent></Card>
        </div>
      </section>

      <Card className="border bg-card shadow-sm">
        <CardHeader><CardTitle>Histórico de movimentações</CardTitle></CardHeader>
        <CardContent className="space-y-4 px-0">
          <div className="grid gap-3 px-4 md:grid-cols-[1fr_220px_180px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto ou observação..." className="pl-9" /></div>
            <Select value={filterProduct} onValueChange={setFilterProduct}><SelectTrigger className="w-full"><SelectValue placeholder="Produto" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os produtos</SelectItem>{products.map((product) => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent></Select>
            <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Entradas e saídas</SelectItem><SelectItem value="entrada">Somente entradas</SelectItem><SelectItem value="saida">Somente saídas</SelectItem></SelectContent></Select>
          </div>
          <Table><TableHeader><TableRow><TableHead className="pl-4">Produto</TableHead><TableHead>Tipo</TableHead><TableHead>Quantidade</TableHead><TableHead className="hidden md:table-cell">Observação</TableHead><TableHead className="hidden lg:table-cell">Responsável</TableHead><TableHead className="pr-4 text-right">Data</TableHead></TableRow></TableHeader><TableBody>
            {filtered.map((movement) => <TableRow key={movement.id}><TableCell className="pl-4 font-medium">{movement.productName}</TableCell><TableCell><Badge variant="outline" className={movement.type === "entrada" ? "border-primary/25 bg-primary/10 text-primary" : "border-orange-400/25 bg-orange-400/10 text-orange-300"}>{movement.type === "entrada" ? <ArrowDownToLine /> : <ArrowUpFromLine />}{movement.type}</Badge></TableCell><TableCell className="metric-number font-semibold">{movement.quantity}</TableCell><TableCell className="hidden max-w-sm truncate text-muted-foreground md:table-cell">{movement.observation || "—"}</TableCell><TableCell className="hidden lg:table-cell">{movement.userName}</TableCell><TableCell className="pr-4 text-right text-xs text-muted-foreground">{dateTimeFormatter.format(new Date(movement.movementDate))}</TableCell></TableRow>)}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-40 text-center text-muted-foreground">Nenhuma movimentação encontrada.</TableCell></TableRow>}
          </TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
