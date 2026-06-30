import { NextResponse } from "next/server";
import { apiError, apiUser, assertSameOrigin, jsonBody } from "@/lib/api";
import { createCategory, listCategories } from "@/lib/inventory-service";

export async function GET(request: Request) {
  try {
    await apiUser();
    const search = new URL(request.url).searchParams.get("search") || "";
    return NextResponse.json({ data: await listCategories(search) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await apiUser();
    assertSameOrigin(request);
    const category = await createCategory(await jsonBody(request));
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
