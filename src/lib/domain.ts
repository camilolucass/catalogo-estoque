export type StockStatus = "available" | "low" | "out";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  type: "entrada" | "saida";
  quantity: number;
  movementDate: string;
  observation: string | null;
  createdAt: string;
}

export interface DashboardData {
  metrics: {
    totalProducts: number;
    totalCategories: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    entriesThisMonth: number;
    exitsThisMonth: number;
  };
  productsByCategory: Array<{ name: string; total: number }>;
  movementTrend: Array<{ date: string; entradas: number; saidas: number }>;
  recentMovements: StockMovement[];
  attentionProducts: Product[];
}

export function getStockStatus(product: Pick<Product, "stockQuantity" | "minimumStock">): StockStatus {
  if (product.stockQuantity === 0) return "out";
  if (product.stockQuantity < product.minimumStock) return "low";
  return "available";
}
