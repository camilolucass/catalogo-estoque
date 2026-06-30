import { describe, expect, it } from "vitest";
import { getStockStatus } from "./domain";
import { movementSchema, productCreateSchema } from "./validation";

describe("regras de produto", () => {
  const validProduct = {
    categoryId: "20000000-0000-4000-8000-000000000001",
    name: "Mouse sem fio",
    description: "Periférico",
    price: 89.9,
    initialStock: 10,
    minimumStock: 5,
  };

  it("rejeita preço negativo", () => {
    expect(productCreateSchema.safeParse({ ...validProduct, price: -1 }).success).toBe(false);
  });

  it("rejeita quantidade fracionada", () => {
    expect(productCreateSchema.safeParse({ ...validProduct, initialStock: 1.5 }).success).toBe(false);
  });

  it("considera estoque igual ao mínimo como disponível", () => {
    expect(getStockStatus({ stockQuantity: 5, minimumStock: 5 })).toBe("available");
  });

  it("prioriza o alerta sem estoque", () => {
    expect(getStockStatus({ stockQuantity: 0, minimumStock: 5 })).toBe("out");
  });
});

describe("regras de movimentação", () => {
  it("rejeita movimentação sem quantidade positiva", () => {
    const result = movementSchema.safeParse({
      productId: "30000000-0000-4000-8000-000000000001",
      type: "saida",
      quantity: 0,
      movementDate: new Date().toISOString(),
      observation: "Teste",
    });
    expect(result.success).toBe(false);
  });

  it("aceita apenas entrada ou saída", () => {
    const result = movementSchema.safeParse({
      productId: "30000000-0000-4000-8000-000000000001",
      type: "ajuste",
      quantity: 1,
      movementDate: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
