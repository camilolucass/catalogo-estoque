import { NextResponse } from "next/server";
import { apiError, apiUser, assertSameOrigin, jsonBody } from "@/lib/api";
import { createProduct, listProducts } from "@/lib/inventory-service";

export async function GET(request: Request) {
  try {
    await apiUser();
    const params = new URL(request.url).searchParams;
    const status = params.get("status");
    return NextResponse.json({
      data: await listProducts({
        search: params.get("search") || undefined,
        categoryId: params.get("categoryId") || undefined,
        status: status === "available" || status === "low" || status === "out" ? status : "all",
        includeInactive: params.get("includeInactive") === "true",
      }),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await apiUser();
    assertSameOrigin(request);
    const product = await createProduct(await jsonBody(request), user.id);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
