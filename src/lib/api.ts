import "server-only";

import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { AppError, toPublicError } from "@/lib/errors";

export async function apiUser() {
  const user = await requireApiUser();
  if (!user) throw new AppError("Sessão expirada. Entre novamente.", 401, "UNAUTHORIZED");
  return user;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);
  if (originUrl.host !== requestUrl.host) {
    throw new AppError("Origem da requisição não permitida.", 403, "INVALID_ORIGIN");
  }
}

export async function jsonBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new AppError("Envie os dados em formato JSON.", 415, "UNSUPPORTED_MEDIA_TYPE");
  }
  try {
    return await request.json();
  } catch {
    throw new AppError("O corpo da requisição é inválido.", 400, "INVALID_JSON");
  }
}

export function apiError(error: unknown) {
  const publicError = toPublicError(error);
  if (publicError.status >= 500) console.error("API error", error);
  return NextResponse.json(publicError.body, { status: publicError.status });
}
