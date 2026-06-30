import "server-only";

import { randomUUID } from "node:crypto";
import type { Category, Product, StockMovement } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import type {
  CategoryInput,
  MovementInput,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validation";
import type { InventoryRepository } from "./types";

interface DemoStore {
  categories: Omit<Category, "productCount">[];
  products: Product[];
  movements: StockMovement[];
}

declare global {
  var __inventoryDemoStore: DemoStore | undefined;
}

const userId = "10000000-0000-4000-8000-000000000001";
const categoryIds = {
  informatica: "20000000-0000-4000-8000-000000000001",
  escritorio: "20000000-0000-4000-8000-000000000002",
  limpeza: "20000000-0000-4000-8000-000000000003",
  manutencao: "20000000-0000-4000-8000-000000000004",
};

function iso(daysAgo: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
}

function createInitialStore(): DemoStore {
  const now = new Date().toISOString();
  const categories = [
    { id: categoryIds.informatica, name: "Informática", description: "Periféricos, acessórios e equipamentos", createdAt: now, updatedAt: now },
    { id: categoryIds.escritorio, name: "Escritório", description: "Materiais para a rotina administrativa", createdAt: now, updatedAt: now },
    { id: categoryIds.limpeza, name: "Limpeza", description: "Higiene e conservação dos ambientes", createdAt: now, updatedAt: now },
    { id: categoryIds.manutencao, name: "Manutenção", description: "Ferramentas e peças de reposição", createdAt: now, updatedAt: now },
  ];
  const products: Product[] = [
    { id: "30000000-0000-4000-8000-000000000001", categoryId: categoryIds.informatica, categoryName: "Informática", name: "Mouse sem fio", description: "Mouse ergonômico 2.4 GHz", price: 89.9, stockQuantity: 12, minimumStock: 5, isActive: true, createdAt: now, updatedAt: now },
    { id: "30000000-0000-4000-8000-000000000002", categoryId: categoryIds.informatica, categoryName: "Informática", name: "Teclado USB", description: "Teclado ABNT2 de perfil baixo", price: 129.9, stockQuantity: 4, minimumStock: 5, isActive: true, createdAt: now, updatedAt: now },
    { id: "30000000-0000-4000-8000-000000000003", categoryId: categoryIds.informatica, categoryName: "Informática", name: "Monitor 24 polegadas", description: "Painel IPS Full HD", price: 899, stockQuantity: 0, minimumStock: 2, isActive: true, createdAt: now, updatedAt: now },
    { id: "30000000-0000-4000-8000-000000000004", categoryId: categoryIds.manutencao, categoryName: "Manutenção", name: "Cabo HDMI", description: "Cabo HDMI 2.0 de 2 metros", price: 39.9, stockQuantity: 8, minimumStock: 4, isActive: true, createdAt: now, updatedAt: now },
    { id: "30000000-0000-4000-8000-000000000005", categoryId: categoryIds.escritorio, categoryName: "Escritório", name: "Papel A4", description: "Resma com 500 folhas", price: 32.5, stockQuantity: 3, minimumStock: 8, isActive: true, createdAt: now, updatedAt: now },
  ];
  const movementData: Array<[string, "entrada" | "saida", number, number, string]> = [
    [products[0].id, "entrada", 20, 6, "Compra inicial"],
    [products[0].id, "saida", 8, 2, "Distribuição para equipe"],
    [products[1].id, "entrada", 10, 5, "Compra inicial"],
    [products[1].id, "saida", 6, 1, "Novas estações"],
    [products[2].id, "entrada", 5, 7, "Compra inicial"],
    [products[2].id, "saida", 5, 0, "Expansão do escritório"],
    [products[3].id, "entrada", 12, 4, "Compra inicial"],
    [products[3].id, "saida", 4, 1, "Instalações de sala"],
    [products[4].id, "entrada", 20, 6, "Compra inicial"],
    [products[4].id, "saida", 17, 0, "Consumo administrativo"],
  ];
  const movements = movementData.map(([productId, type, quantity, daysAgo, observation], index) => {
    const product = products.find((item) => item.id === productId)!;
    return {
      id: `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      productId,
      productName: product.name,
      userId,
      userName: "Climba",
      type,
      quantity,
      movementDate: iso(daysAgo, 9 + (index % 6)),
      observation,
      createdAt: iso(daysAgo, 9 + (index % 6)),
    } satisfies StockMovement;
  });
  return { categories, products, movements };
}

function getStore() {
  globalThis.__inventoryDemoStore ??= createInitialStore();
  return globalThis.__inventoryDemoStore;
}

function categoryWithCount(category: Omit<Category, "productCount">, store: DemoStore): Category {
  return {
    ...category,
    productCount: store.products.filter((product) => product.categoryId === category.id).length,
  };
}

export class DemoInventoryRepository implements InventoryRepository {
  async listCategories() {
    const store = getStore();
    return store.categories.map((category) => categoryWithCount(category, store));
  }

  async createCategory(input: CategoryInput) {
    const store = getStore();
    if (store.categories.some((item) => item.name.localeCompare(input.name, "pt-BR", { sensitivity: "base" }) === 0)) {
      throw new AppError("Já existe uma categoria com esse nome.", 409, "CATEGORY_EXISTS");
    }
    const now = new Date().toISOString();
    const category = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
    store.categories.push(category);
    return categoryWithCount(category, store);
  }

  async updateCategory(id: string, input: CategoryInput) {
    const store = getStore();
    const category = store.categories.find((item) => item.id === id);
    if (!category) throw new AppError("Categoria não encontrada.", 404, "NOT_FOUND");
    if (store.categories.some((item) => item.id !== id && item.name.localeCompare(input.name, "pt-BR", { sensitivity: "base" }) === 0)) {
      throw new AppError("Já existe uma categoria com esse nome.", 409, "CATEGORY_EXISTS");
    }
    Object.assign(category, input, { updatedAt: new Date().toISOString() });
    return categoryWithCount(category, store);
  }

  async deleteCategory(id: string) {
    const store = getStore();
    if (store.products.some((product) => product.categoryId === id)) {
      throw new AppError("Transfira ou remova os produtos antes de excluir esta categoria.", 409, "CATEGORY_HAS_PRODUCTS");
    }
    const index = store.categories.findIndex((item) => item.id === id);
    if (index < 0) throw new AppError("Categoria não encontrada.", 404, "NOT_FOUND");
    store.categories.splice(index, 1);
  }

  async listProducts() {
    return [...getStore().products];
  }

  async getProduct(id: string) {
    return getStore().products.find((item) => item.id === id) ?? null;
  }

  async createProduct(input: ProductCreateInput, actorId: string) {
    const store = getStore();
    const category = store.categories.find((item) => item.id === input.categoryId);
    if (!category) throw new AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
    const now = new Date().toISOString();
    const product: Product = {
      id: randomUUID(), categoryId: input.categoryId, categoryName: category.name,
      name: input.name, description: input.description, price: input.price,
      stockQuantity: 0, minimumStock: input.minimumStock, isActive: true,
      createdAt: now, updatedAt: now,
    };
    store.products.push(product);
    if (input.initialStock > 0) {
      await this.createMovement({ productId: product.id, type: "entrada", quantity: input.initialStock, movementDate: now, observation: "Estoque inicial" }, actorId);
    }
    return product;
  }

  async updateProduct(id: string, input: ProductUpdateInput) {
    const store = getStore();
    const product = store.products.find((item) => item.id === id);
    if (!product) throw new AppError("Produto não encontrado.", 404, "NOT_FOUND");
    const category = store.categories.find((item) => item.id === input.categoryId);
    if (!category) throw new AppError("Categoria não encontrada.", 404, "CATEGORY_NOT_FOUND");
    Object.assign(product, input, { categoryName: category.name, updatedAt: new Date().toISOString() });
    return product;
  }

  async deleteProduct(id: string) {
    const store = getStore();
    const index = store.products.findIndex((item) => item.id === id);
    if (index < 0) throw new AppError("Produto não encontrado.", 404, "NOT_FOUND");
    const hasMovements = store.movements.some((movement) => movement.productId === id);
    if (hasMovements) {
      store.products[index].isActive = false;
      store.products[index].updatedAt = new Date().toISOString();
      return { inactivated: true };
    }
    store.products.splice(index, 1);
    return { inactivated: false };
  }

  async listMovements() {
    return [...getStore().movements].sort((a, b) => b.movementDate.localeCompare(a.movementDate));
  }

  async createMovement(input: MovementInput, actorId: string) {
    const store = getStore();
    const product = store.products.find((item) => item.id === input.productId);
    if (!product) throw new AppError("Produto não encontrado.", 404, "NOT_FOUND");
    if (!product.isActive) throw new AppError("Produto inativo não pode ser movimentado.", 422, "PRODUCT_INACTIVE");
    if (input.type === "saida" && input.quantity > product.stockQuantity) {
      throw new AppError("A quantidade de saída é maior que o estoque disponível.", 422, "INSUFFICIENT_STOCK");
    }
    product.stockQuantity += input.type === "entrada" ? input.quantity : -input.quantity;
    product.updatedAt = new Date().toISOString();
    const movement: StockMovement = {
      id: randomUUID(), productId: product.id, productName: product.name,
      userId: actorId, userName: "Climba", type: input.type, quantity: input.quantity,
      movementDate: input.movementDate, observation: input.observation,
      createdAt: new Date().toISOString(),
    };
    store.movements.push(movement);
    return movement;
  }
}
