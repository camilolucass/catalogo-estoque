import { NextResponse } from "next/server";
import { apiError, apiUser, assertSameOrigin, jsonBody } from "@/lib/api";
import { deleteProduct, getProduct, updateProduct } from "@/lib/inventory-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await apiUser();
    const { id } = await context.params;
    return NextResponse.json({ data: await getProduct(id) });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await apiUser();
    assertSameOrigin(request);
    const { id } = await context.params;
    return NextResponse.json({ data: await updateProduct(id, await jsonBody(request)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await apiUser();
    assertSameOrigin(request);
    const { id } = await context.params;
    return NextResponse.json({ data: await deleteProduct(id) });
  } catch (error) {
    return apiError(error);
  }
}
