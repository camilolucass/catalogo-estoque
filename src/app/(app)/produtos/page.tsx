import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProductManager } from "@/components/product-manager";
import { listCategories, listProducts } from "@/lib/inventory-service";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([listProducts({ includeInactive: true }), listCategories()]);
  return (
    <div className="space-y-7">
      <PageHeader title="Produtos" />
      <ProductManager products={products} categories={categories} />
    </div>
  );
}
