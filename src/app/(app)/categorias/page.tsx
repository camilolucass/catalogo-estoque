import type { Metadata } from "next";
import { CategoryManager } from "@/components/category-manager";
import { PageHeader } from "@/components/page-header";
import { listCategories } from "@/lib/inventory-service";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Organização" title="Categorias" description="Estruture o catálogo, acompanhe os vínculos e mantenha cada grupo de materiais sob controle." />
      <CategoryManager categories={categories} />
    </div>
  );
}
