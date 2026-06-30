"use server";

import { redirect } from "next/navigation";
import { clearDemoSession, createDemoSession, validateDemoCredentials } from "@/lib/auth/demo-session";
import { getDemoCredentials, isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (!username || !password) return { error: "Informe usuário e senha." };

  if (isDemoMode()) {
    if (!validateDemoCredentials(username, password)) return { error: "Usuário ou senha inválidos." };
    await createDemoSession();
  } else {
    const credentials = getDemoCredentials();
    if (username.localeCompare(credentials.username, "pt-BR", { sensitivity: "base" }) !== 0) {
      return { error: "Usuário ou senha inválidos." };
    }
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email: credentials.email, password });
    if (error) return { error: "Usuário ou senha inválidos." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  if (isDemoMode()) {
    await clearDemoSession();
  } else {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
