import type { Metadata } from "next";
import { CategoryManager } from "@/components/category-manager";
import { PageHeader } from "@/components/page-header";
import { listCategories } from "@/lib/inventory-service";

export const metadata: Metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="space-y-7">
      <PageHeader title="Categorias" />
      <CategoryManager categories={categories} />
    </div>
  );
}
