import "server-only";

import { isDemoMode } from "@/lib/env";
import { DemoInventoryRepository } from "./demo";
import { SupabaseInventoryRepository } from "./supabase";
import type { InventoryRepository } from "./types";

export function getInventoryRepository(): InventoryRepository {
  return isDemoMode() ? new DemoInventoryRepository() : new SupabaseInventoryRepository();
}
