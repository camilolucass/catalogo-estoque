import "server-only";

import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/domain";
import { isDemoMode } from "@/lib/env";
import { getDemoUser } from "@/lib/auth/demo-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (isDemoMode()) return getDemoUser();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;

  const metadata = data.claims.user_metadata as { name?: string } | undefined;
  const email = typeof data.claims.email === "string" ? data.claims.email : "";
  return {
    id: data.claims.sub,
    email,
    name: metadata?.name || email.split("@")[0] || "Usuário",
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  return user;
}
