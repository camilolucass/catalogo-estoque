import { NextResponse } from "next/server";
import { apiError, apiUser } from "@/lib/api";
import { getDashboard } from "@/lib/inventory-service";

export async function GET() {
  try {
    await apiUser();
    return NextResponse.json({ data: await getDashboard() });
  } catch (error) {
    return apiError(error);
  }
}
