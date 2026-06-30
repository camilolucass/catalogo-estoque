import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center"><span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-primary"><PackageSearch className="size-8" /></span><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Erro 404</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">Registro não encontrado</h1><p className="mt-3 text-muted-foreground">O conteúdo pode ter sido removido ou o endereço está incorreto.</p><Button asChild className="mt-7"><Link href="/dashboard"><ArrowLeft />Voltar ao dashboard</Link></Button></div>
    </main>
  );
}
