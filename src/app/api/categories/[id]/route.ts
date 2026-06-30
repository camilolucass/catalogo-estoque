import { NextResponse } from "next/server";
import { apiError, apiUser, assertSameOrigin, jsonBody } from "@/lib/api";
import { deleteCategory, updateCategory } from "@/lib/inventory-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await apiUser();
    assertSameOrigin(request);
    const { id } = await context.params;
    return NextResponse.json({ data: await updateCategory(id, await jsonBody(request)) });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await apiUser();
    assertSameOrigin(request);
    const { id } = await context.params;
    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
