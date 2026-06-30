import { z } from "zod";

const optionalDescription = z
  .string()
  .trim()
  .max(500, "A descrição deve ter no máximo 500 caracteres.")
  .optional()
  .nullable()
  .transform((value) => value || null);

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da categoria.").max(80),
  description: optionalDescription,
});

const moneySchema = z.coerce
  .number({ error: "Informe um preço válido." })
  .min(0, "O preço não pode ser negativo.")
  .refine((value) => Number.isInteger(value * 100), "Use no máximo duas casas decimais.");

const nonNegativeInteger = (message: string) =>
  z.coerce.number({ error: message }).int(message).min(0, message);

export const productCreateSchema = z.object({
  categoryId: z.string().uuid("Selecione uma categoria."),
  name: z.string().trim().min(2, "Informe o nome do produto.").max(120),
  description: optionalDescription,
  price: moneySchema,
  initialStock: nonNegativeInteger("O estoque inicial deve ser um número inteiro não negativo."),
  minimumStock: nonNegativeInteger("O estoque mínimo deve ser um número inteiro não negativo.").default(5),
});

export const productUpdateSchema = productCreateSchema
  .omit({ initialStock: true })
  .extend({ isActive: z.boolean().optional() });

export const movementSchema = z.object({
  productId: z.string().uuid("Selecione um produto."),
  type: z.enum(["entrada", "saida"], { error: "Selecione o tipo da movimentação." }),
  quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero."),
  movementDate: z.coerce.date({ error: "Informe uma data válida." }).transform((date) => date.toISOString()),
  observation: z
    .string()
    .trim()
    .max(500, "A observação deve ter no máximo 500 caracteres.")
    .optional()
    .nullable()
    .transform((value) => value || null),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type MovementInput = z.infer<typeof movementSchema>;
