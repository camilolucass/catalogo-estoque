export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toPublicError(error: unknown) {
  if (error instanceof AppError) {
    return { status: error.status, body: { error: error.message, code: error.code } };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("duplicate") || message.includes("unique")) {
      return {
        status: 409,
        body: { error: "Já existe um registro com essas informações.", code: "CONFLICT" },
      };
    }
    if (message.includes("estoque") || message.includes("stock")) {
      return { status: 422, body: { error: error.message, code: "STOCK_RULE" } };
    }
  }

  return {
    status: 500,
    body: { error: "Não foi possível concluir a operação.", code: "INTERNAL_ERROR" },
  };
}
