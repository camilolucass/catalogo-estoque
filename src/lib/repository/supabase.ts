import "server-only";

import type { Category, Product, StockMovement } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CategoryInput,
  MovementInput,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validation";
import type { InventoryRepository } from "./types";

type RecordRow = Record<string, unknown>;

function relationName(value: unknown, fallback = "Sem categoria") {
  if (Array.isArray(value)) return String((value[0] as RecordRow | undefined)?.name ?? fallback);
  if (value && typeof value === "object") return String((value as RecordRow).name ?? fallback);
  return fallback;
}

function mapProduct(row: RecordRow): Product {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    categoryName: relationName(row.category),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    price: Number(row.price),
    stockQuantity: Number(row.stock_quantity),
    minimumStock: Number(row.minimum_stock),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMovement(row: RecordRow): StockMovement {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    productName: relationName(row.product, "Produto removido"),
    userId: String(row.user_id),
    userName: relationName(row.profile, "Usuário"),
    type: row.type as "entrada" | "saida",
    quantity: Number(row.quantity),
    movementDate: String(row.movement_date),
    observation: row.observation ? String(row.observation) : null,
    createdAt: String(row.created_at),
  };
}

function fail(error: { message: string } | null, fallback: string): never {
  throw new AppError(error?.message || fallback, 400, "DATABASE_ERROR");
}

export class SupabaseInventoryRepository implements InventoryRepository {
  async listCategories() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, products(count)")
      .order("name");
    if (error) fail(error, "Não foi possível listar as categorias.");
    return (data as RecordRow[]).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      description: row.description ? String(row.description) : null,
      productCount: Number(((row.products as Array<{ count: number }>)?.[0]?.count) ?? 0),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    } satisfies Category));
  }

  async createCategory(input: CategoryInput) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: input.name, description: input.description })
      .select()
      .single();
    if (error || !data) fail(error, "Não foi possível criar a categoria.");
    return { id: data.id, name: data.name, description: data.description, productCount: 0, createdAt: data.created_at, updatedAt: data.updated_at };
  }

  async updateCategory(id: string, input: CategoryInput) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ name: input.name, description: input.description })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) fail(error, "Não foi possível atualizar a categoria.");
    const products = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    return { id: data.id, name: data.name, description: data.description, productCount: products.count ?? 0, createdAt: data.created_at, updatedAt: data.updated_at };
  }

  async deleteCategory(id: string) {
    const supabase = await createSupabaseServerClient();
    const linked = await supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if ((linked.count ?? 0) > 0) throw new AppError("Transfira ou remova os produtos antes de excluir esta categoria.", 409, "CATEGORY_HAS_PRODUCTS");
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) fail(error, "Não foi possível excluir a categoria.");
  }

  async listProducts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select("*, category:categories(name)").order("name");
    if (error) fail(error, "Não foi possível listar os produtos.");
    return (data as RecordRow[]).map(mapProduct);
  }

  async getProduct(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select("*, category:categories(name)").eq("id", id).maybeSingle();
    if (error) fail(error, "Não foi possível buscar o produto.");
    return data ? mapProduct(data as RecordRow) : null;
  }

  async createProduct(input: ProductCreateInput) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("create_product_with_initial_stock", {
      p_category_id: input.categoryId,
      p_name: input.name,
      p_description: input.description,
      p_price: input.price,
      p_initial_stock: input.initialStock,
      p_minimum_stock: input.minimumStock,
    });
    if (error || !data) fail(error, "Não foi possível criar o produto.");
    const product = await this.getProduct(String((data as RecordRow).id));
    if (!product) throw new AppError("Produto criado, mas não localizado.", 500);
    return product;
  }

  async updateProduct(id: string, input: ProductUpdateInput) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .update({
        category_id: input.categoryId,
        name: input.name,
        description: input.description,
        price: input.price,
        minimum_stock: input.minimumStock,
        ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
      })
      .eq("id", id)
      .select("*, category:categories(name)")
      .single();
    if (error || !data) fail(error, "Não foi possível atualizar o produto.");
    return mapProduct(data as RecordRow);
  }

  async deleteProduct(id: string) {
    const supabase = await createSupabaseServerClient();
    const movements = await supabase.from("stock_movements").select("id", { count: "exact", head: true }).eq("product_id", id);
    if ((movements.count ?? 0) > 0) {
      const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
      if (error) fail(error, "Não foi possível inativar o produto.");
      return { inactivated: true };
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) fail(error, "Não foi possível excluir o produto.");
    return { inactivated: false };
  }

  async listMovements() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*, product:products(name), profile:profiles(name)")
      .order("movement_date", { ascending: false });
    if (error) fail(error, "Não foi possível listar as movimentações.");
    return (data as RecordRow[]).map(mapMovement);
  }

  async createMovement(input: MovementInput) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("register_stock_movement", {
      p_product_id: input.productId,
      p_type: input.type,
      p_quantity: input.quantity,
      p_movement_date: input.movementDate,
      p_observation: input.observation,
    });
    if (error || !data) fail(error, "Não foi possível registrar a movimentação.");
    const row = data as RecordRow;
    const product = await this.getProduct(String(row.product_id));
    return {
      id: String(row.id), productId: String(row.product_id), productName: product?.name || "Produto",
      userId: String(row.user_id), userName: "Climba", type: row.type as "entrada" | "saida",
      quantity: Number(row.quantity), movementDate: String(row.movement_date),
      observation: row.observation ? String(row.observation) : null, createdAt: String(row.created_at),
    };
  }
}
