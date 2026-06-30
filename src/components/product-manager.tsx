"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Ellipsis, Eye, LoaderCircle, PackagePlus, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { StockBadge } from "@/components/stock-badge";
import type { Category, Product } from "@/lib/domain";
import { getStockStatus } from "@/lib/domain";
import { currencyFormatter } from "@/lib/format";

interface ProductManagerProps {
  products: Product[];
  categories: Category[];
}

async function responseMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || "Não foi possível concluir a operação.";
}

export function ProductManager({ products, categories }: ProductManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      if (query && !product.name.toLocaleLowerCase("pt-BR").includes(query)) return false;
      if (categoryFilter !== "all" && product.categoryId !== categoryFilter) return false;
      if (statusFilter !== "all" && getStockStatus(product) !== statusFilter) return false;
      if (activityFilter === "active" && !product.isActive) return false;
      if (activityFilter === "inactive" && product.isActive) return false;
      return true;
    });
  }, [activityFilter, categoryFilter, products, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setDialogOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const form = new FormData(event.currentTarget);
      const body = {
        name: form.get("name"),
        description: form.get("description"),
        categoryId: form.get("categoryId"),
        price: form.get("price"),
        minimumStock: form.get("minimumStock"),
        ...(!editing ? { initialStock: form.get("initialStock") } : {}),
      };
      const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) return toast.error(await responseMessage(response));
      toast.success(editing ? "Produto atualizado." : "Produto criado com estoque inicial registrado.");
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir a operação.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    setPending(true);
    try {
      const response = await fetch(`/api/products/${deleting.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { data?: { inactivated: boolean }; error?: string } | null;
      if (!response.ok) return toast.error(payload?.error || "Não foi possível excluir o produto.");
      toast.success(payload?.data?.inactivated ? "Produto inativado para preservar o histórico." : "Produto excluído.");
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir o produto.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_180px_160px_auto]">
        <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto..." className="pl-9" /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as categorias</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue placeholder="Estoque" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os estoques</SelectItem><SelectItem value="available">Disponível</SelectItem><SelectItem value="low">Estoque baixo</SelectItem><SelectItem value="out">Sem estoque</SelectItem></SelectContent></Select>
        <Select value={activityFilter} onValueChange={setActivityFilter}><SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger><SelectContent><SelectItem value="active">Ativos</SelectItem><SelectItem value="inactive">Inativos</SelectItem><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><PackagePlus />Novo produto</Button></DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form key={editing?.id || "new"} onSubmit={submit}>
              <DialogHeader><DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle><DialogDescription>{editing ? "O saldo é alterado exclusivamente por movimentações." : "O estoque inicial será registrado como a primeira entrada do histórico."}</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="product-name">Nome</Label><Input id="product-name" name="name" defaultValue={editing?.name} placeholder="Ex.: Mouse sem fio" maxLength={120} required /></div>
                <div className="space-y-2 sm:col-span-2"><Label htmlFor="product-description">Descrição</Label><Textarea id="product-description" name="description" defaultValue={editing?.description || ""} placeholder="Características principais do produto" maxLength={500} /></div>
                <div className="space-y-2"><Label>Categoria</Label><Select name="categoryId" defaultValue={editing?.categoryId || categories[0]?.id} required><SelectTrigger className="w-full"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="product-price">Preço</Label><Input id="product-price" name="price" type="number" min="0" step="0.01" defaultValue={editing?.price} placeholder="0,00" required /></div>
                {!editing && <div className="space-y-2"><Label htmlFor="initial-stock">Estoque inicial</Label><Input id="initial-stock" name="initialStock" type="number" min="0" step="1" defaultValue="0" required /></div>}
                <div className="space-y-2"><Label htmlFor="minimum-stock">Estoque mínimo</Label><Input id="minimum-stock" name="minimumStock" type="number" min="0" step="1" defaultValue={editing?.minimumStock ?? 5} required /></div>
              </div>
              <DialogFooter><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={pending || categories.length === 0}>{pending && <LoaderCircle className="animate-spin" />}{editing ? "Salvar alterações" : "Criar produto"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border bg-card shadow-sm">
        <CardContent className="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-4">Produto</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Status</TableHead><TableHead className="w-14 pr-4"><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id} className={!product.isActive ? "opacity-55" : undefined}>
                  <TableCell className="pl-4"><div><p className="font-medium">{product.name}</p><p className="max-w-xs truncate text-xs text-muted-foreground">{product.description || "Sem descrição"}</p></div></TableCell>
                  <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
                  <TableCell className="metric-number">{currencyFormatter.format(product.price)}</TableCell>
                  <TableCell><span className="metric-number text-base font-semibold">{product.stockQuantity}</span><span className="ml-1 text-xs text-muted-foreground">un.</span></TableCell>
                  <TableCell>{product.isActive ? <StockBadge product={product} /> : <span className="text-xs text-muted-foreground">Inativo</span>}</TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Ações de ${product.name}`}><Ellipsis /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuItem asChild><Link href={`/produtos/${product.id}`}><Eye />Ver histórico</Link></DropdownMenuItem>{product.isActive && <DropdownMenuItem asChild><Link href={`/movimentacoes?productId=${product.id}`}><ArrowLeftRight />Movimentar</Link></DropdownMenuItem>}<DropdownMenuItem onClick={() => openEdit(product)}><Pencil />Editar</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDeleting(product)}><Trash2 />{product.isActive ? "Excluir ou inativar" : "Excluir"}</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-44 text-center text-muted-foreground">Nenhum produto corresponde aos filtros.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover {deleting?.name}?</AlertDialogTitle><AlertDialogDescription>Produtos com movimentações serão apenas inativados para preservar toda a rastreabilidade do estoque.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={remove} disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}Confirmar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
