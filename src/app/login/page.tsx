import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Activity, BarChart3, PackageCheck, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

const highlights = [
  { icon: Activity, label: "Estoque em tempo real", value: "Operação segura" },
  { icon: BarChart3, label: "Indicadores visuais", value: "Decisões rápidas" },
  { icon: ShieldCheck, label: "Regras no servidor", value: "Dados protegidos" },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
      <section className="relative hidden min-h-[calc(100vh-4rem)] overflow-hidden rounded-3xl border border-border/60 bg-card/55 p-10 panel-glow lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.19_154/0.16),transparent_28rem)]" />
        <div className="relative">
          <BrandMark />
          <div className="mt-20 max-w-xl">
            <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/10 text-primary">Gestão inteligente de estoque</Badge>
            <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.055em] xl:text-6xl">
              Clareza para operar. <span className="text-primary">Controle</span> para crescer.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Produtos, categorias e movimentações reunidos em uma experiência visual que transforma cada dado em uma decisão simples.
            </p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {highlights.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-background/45 p-4 backdrop-blur-sm">
              <Icon className="mb-5 size-5 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-2 sm:p-8">
        <div className="w-full max-w-md">
          <BrandMark className="mb-10 lg:hidden" />
          <Card className="border-border/70 bg-card/88 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-3 pb-4">
              <div className="mb-2 flex size-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
                <PackageCheck className="size-6" />
              </div>
              <CardTitle className="text-2xl tracking-tight">Bem-vindo de volta</CardTitle>
              <CardDescription>Use suas credenciais para acessar o painel de estoque.</CardDescription>
            </CardHeader>
            <CardContent><LoginForm /></CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">Catálogo e controle operacional</p>
        </div>
      </section>
    </main>
  );
}
