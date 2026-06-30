import "server-only";

import type { DashboardData, Product, StockMovement } from "@/lib/domain";
import { getStockStatus } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import { getInventoryRepository } from "@/lib/repository";
import {
  categorySchema,
  movementSchema,
  productCreateSchema,
  productUpdateSchema,
} from "@/lib/validation";
import type { z } from "zod";

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || "Dados inválidos.", 422, "VALIDATION_ERROR");
  }
  return result.data;
}

export async function listCategories(search = "") {
  const categories = await getInventoryRepository().listCategories();
  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  return normalized
    ? categories.filter((category) => category.name.toLocaleLowerCase("pt-BR").includes(normalized))
    : categories;
}

export async function createCategory(value: unknown) {
  return getInventoryRepository().createCategory(parse(categorySchema, value));
}

export async function updateCategory(id: string, value: unknown) {
  return getInventoryRepository().updateCategory(id, parse(categorySchema, value));
}

export async function deleteCategory(id: string) {
  return getInventoryRepository().deleteCategory(id);
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  status?: "all" | "available" | "low" | "out";
  includeInactive?: boolean;
}

export async function listProducts(filters: ProductFilters = {}) {
  let products = await getInventoryRepository().listProducts();
  if (!filters.includeInactive) products = products.filter((product) => product.isActive);
  if (filters.search) {
    const normalized = filters.search.trim().toLocaleLowerCase("pt-BR");
    products = products.filter((product) => product.name.toLocaleLowerCase("pt-BR").includes(normalized));
  }
  if (filters.categoryId) products = products.filter((product) => product.categoryId === filters.categoryId);
  if (filters.status && filters.status !== "all") {
    products = products.filter((product) => getStockStatus(product) === filters.status);
  }
  return products;
}

export async function getProduct(id: string) {
  const repository = getInventoryRepository();
  const product = await repository.getProduct(id);
  if (!product) throw new AppError("Produto não encontrado.", 404, "NOT_FOUND");
  const movements = (await repository.listMovements()).filter((movement) => movement.productId === id);
  return { product, movements };
}

export async function createProduct(value: unknown, actorId: string) {
  return getInventoryRepository().createProduct(parse(productCreateSchema, value), actorId);
}

export async function updateProduct(id: string, value: unknown) {
  return getInventoryRepository().updateProduct(id, parse(productUpdateSchema, value));
}

export async function deleteProduct(id: string) {
  return getInventoryRepository().deleteProduct(id);
}

export interface MovementFilters {
  productId?: string;
  type?: "entrada" | "saida";
  from?: string;
  to?: string;
}

export async function listMovements(filters: MovementFilters = {}) {
  let movements = await getInventoryRepository().listMovements();
  if (filters.productId) movements = movements.filter((item) => item.productId === filters.productId);
  if (filters.type) movements = movements.filter((item) => item.type === filters.type);
  if (filters.from) movements = movements.filter((item) => item.movementDate >= filters.from!);
  if (filters.to) movements = movements.filter((item) => item.movementDate <= `${filters.to}T23:59:59.999Z`);
  return movements;
}

export async function createMovement(value: unknown, actorId: string) {
  return getInventoryRepository().createMovement(parse(movementSchema, value), actorId);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function movementTrend(movements: StockMovement[]) {
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    date.setHours(0, 0, 0, 0);
    return date;
  });
  return days.map((date) => {
    const key = dateKey(date);
    const daily = movements.filter((item) => dateKey(new Date(item.movementDate)) === key);
    return {
      date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(".", ""),
      entradas: daily.filter((item) => item.type === "entrada").reduce((sum, item) => sum + item.quantity, 0),
      saidas: daily.filter((item) => item.type === "saida").reduce((sum, item) => sum + item.quantity, 0),
    };
  });
}

export async function getDashboard(): Promise<DashboardData> {
  const repository = getInventoryRepository();
  const [categories, allProducts, movements] = await Promise.all([
    repository.listCategories(),
    repository.listProducts(),
    repository.listMovements(),
  ]);
  const products = allProducts.filter((product) => product.isActive);
  const now = new Date();
  const thisMonth = movements.filter((movement) => {
    const date = new Date(movement.movementDate);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const attentionProducts = products
    .filter((product) => getStockStatus(product) !== "available")
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 5);

  return {
    metrics: {
      totalProducts: products.length,
      totalCategories: categories.length,
      lowStockProducts: products.filter((product) => getStockStatus(product) === "low").length,
      outOfStockProducts: products.filter((product) => getStockStatus(product) === "out").length,
      entriesThisMonth: thisMonth.filter((item) => item.type === "entrada").reduce((sum, item) => sum + item.quantity, 0),
      exitsThisMonth: thisMonth.filter((item) => item.type === "saida").reduce((sum, item) => sum + item.quantity, 0),
    },
    productsByCategory: categories.map((category) => ({ name: category.name, total: products.filter((product) => product.categoryId === category.id).length })),
    movementTrend: movementTrend(movements),
    recentMovements: movements.slice(0, 6),
    attentionProducts,
  };
}

export function availableStock(product: Product) {
  return Math.max(0, product.stockQuantity);
}
