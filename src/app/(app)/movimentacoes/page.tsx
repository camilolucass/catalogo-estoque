import type { Metadata } from "next";
import { MovementManager } from "@/components/movement-manager";
import { PageHeader } from "@/components/page-header";
import { listMovements, listProducts } from "@/lib/inventory-service";

export const metadata: Metadata = { title: "Movimentações" };

export default async function MovementsPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const [{ productId }, products, movements] = await Promise.all([searchParams, listProducts({ includeInactive: true }), listMovements()]);
  return (
    <div className="space-y-7">
      <PageHeader title="Movimentações de estoque" />
      <MovementManager products={products} movements={movements} selectedProductId={productId} />
    </div>
  );
}
