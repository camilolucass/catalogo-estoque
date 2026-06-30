import { NextResponse } from "next/server";
import { apiError, apiUser, assertSameOrigin, jsonBody } from "@/lib/api";
import { createMovement, listMovements } from "@/lib/inventory-service";

export async function GET(request: Request) {
  try {
    await apiUser();
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    return NextResponse.json({
      data: await listMovements({
        productId: params.get("productId") || undefined,
        type: type === "entrada" || type === "saida" ? type : undefined,
        from: params.get("from") || undefined,
        to: params.get("to") || undefined,
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
    const movement = await createMovement(await jsonBody(request), user.id);
    return NextResponse.json({ data: movement }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
