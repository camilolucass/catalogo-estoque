"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card className="mx-auto mt-24 max-w-lg border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center py-10 text-center">
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><AlertCircle className="size-7" /></span>
        <h2 className="text-xl font-semibold">Não foi possível carregar esta área</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">A operação falhou com segurança. Tente novamente; nenhum dado parcial foi salvo.</p>
        <Button className="mt-6" onClick={reset}><RefreshCw />Tentar novamente</Button>
      </CardContent>
    </Card>
  );
}
