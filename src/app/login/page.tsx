import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <Card className="w-full max-w-md border bg-card shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Boxes className="size-5" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl tracking-tight">Acesso ao sistema</CardTitle>
          <CardDescription>Informe seu usuário e senha para continuar.</CardDescription>
        </CardHeader>
        <CardContent><LoginForm /></CardContent>
      </Card>
    </main>
  );
}
