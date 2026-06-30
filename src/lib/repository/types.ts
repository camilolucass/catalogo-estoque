import type { Category, Product, StockMovement } from "@/lib/domain";
import type {
  CategoryInput,
  MovementInput,
  ProductCreateInput,
  ProductUpdateInput,
} from "@/lib/validation";

export interface InventoryRepository {
  listCategories(): Promise<Category[]>;
  createCategory(input: CategoryInput): Promise<Category>;
  updateCategory(id: string, input: CategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(input: ProductCreateInput, userId: string): Promise<Product>;
  updateProduct(id: string, input: ProductUpdateInput): Promise<Product>;
  deleteProduct(id: string): Promise<{ inactivated: boolean }>;
  listMovements(): Promise<StockMovement[]>;
  createMovement(input: MovementInput, userId: string): Promise<StockMovement>;
}
