import type { Metadata } from "next";
import { MovementManager } from "@/components/movement-manager";
import { PageHeader } from "@/components/page-header";
import { listMovements, listProducts } from "@/lib/inventory-service";

export const metadata: Metadata = { title: "Movimentações" };

export default async function MovementsPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const [{ productId }, products, movements] = await Promise.all([searchParams, listProducts({ includeInactive: true }), listMovements()]);
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Operação" title="Movimentações de estoque" description="Registre entradas e saídas com atualização automática, validação de saldo e rastreabilidade completa." />
      <MovementManager products={products} movements={movements} selectedProductId={productId} />
    </div>
  );
}
