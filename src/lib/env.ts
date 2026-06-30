import "server-only";

import { AppError } from "@/lib/errors";

export function isDemoMode() {
  return process.env.NODE_ENV !== "production" && process.env.APP_DEMO_MODE === "true";
}

export function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new AppError(
      "As variáveis do Supabase ainda não foram configuradas.",
      503,
      "SUPABASE_NOT_CONFIGURED",
    );
  }

  return { url, publishableKey };
}

export function getDemoCredentials() {
  return {
    username: process.env.DEMO_USERNAME || "Climba",
    email: process.env.DEMO_USER_EMAIL || "climba@example.com",
    password: process.env.DEMO_USER_PASSWORD || "",
  };
}
