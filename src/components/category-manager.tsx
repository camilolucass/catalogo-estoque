"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, FolderPlus, LoaderCircle, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/domain";
import { dateFormatter } from "@/lib/format";

interface CategoryManagerProps {
  categories: Category[];
}

async function responseMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || "Não foi possível concluir a operação.";
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase("pt-BR");
    return value ? categories.filter((category) => category.name.toLocaleLowerCase("pt-BR").includes(value)) : categories;
  }, [categories, search]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDialogOpen(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(editing ? `/api/categories/${editing.id}` : "/api/categories", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), description: form.get("description") }),
    });
    setPending(false);
    if (!response.ok) return toast.error(await responseMessage(response));
    toast.success(editing ? "Categoria atualizada." : "Categoria criada.");
    setDialogOpen(false);
    router.refresh();
  }

  async function remove() {
    if (!deleting) return;
    setPending(true);
    const response = await fetch(`/api/categories/${deleting.id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) return toast.error(await responseMessage(response));
    toast.success("Categoria excluída.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria..." className="pl-9" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={openCreate}><FolderPlus />Nova categoria</Button></DialogTrigger>
          <DialogContent>
            <form key={editing?.id || "new"} onSubmit={submit}>
              <DialogHeader><DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle><DialogDescription>Organize os produtos em grupos fáceis de localizar.</DialogDescription></DialogHeader>
              <div className="space-y-4 py-5">
                <div className="space-y-2"><Label htmlFor="category-name">Nome</Label><Input id="category-name" name="name" defaultValue={editing?.name} placeholder="Ex.: Informática" maxLength={80} required /></div>
                <div className="space-y-2"><Label htmlFor="category-description">Descrição</Label><Textarea id="category-description" name="description" defaultValue={editing?.description || ""} placeholder="Descreva o tipo de material desta categoria" maxLength={500} /></div>
              </div>
              <DialogFooter><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}{editing ? "Salvar alterações" : "Criar categoria"}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/70 bg-card/78">
        <CardContent className="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-4">Categoria</TableHead><TableHead>Descrição</TableHead><TableHead>Produtos</TableHead><TableHead className="hidden md:table-cell">Atualizada em</TableHead><TableHead className="w-14 pr-4"><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="pl-4 font-medium">{category.name}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{category.description || "Sem descrição"}</TableCell>
                  <TableCell><Badge variant="secondary" className="metric-number">{category.productCount}</Badge></TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{dateFormatter.format(new Date(category.updatedAt))}</TableCell>
                  <TableCell className="pr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Ações de ${category.name}`}><Ellipsis /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(category)}><Pencil />Editar</DropdownMenuItem><DropdownMenuItem variant="destructive" onClick={() => setDeleting(category)}><Trash2 />Excluir</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground">Nenhuma categoria encontrada.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir {deleting?.name}?</AlertDialogTitle><AlertDialogDescription>A exclusão será bloqueada caso existam produtos vinculados à categoria.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={remove} disabled={pending}>{pending && <LoaderCircle className="animate-spin" />}Excluir categoria</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  );
}
