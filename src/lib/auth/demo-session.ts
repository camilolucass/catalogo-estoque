import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/domain";
import { getDemoCredentials } from "@/lib/env";

const COOKIE_NAME = "inventory_demo_session";

function getSecret() {
  return process.env.DEMO_SESSION_SECRET || "local-development-session-key";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validateDemoCredentials(username: string, password: string) {
  const credentials = getDemoCredentials();
  return (
    username.trim().localeCompare(credentials.username, "pt-BR", { sensitivity: "base" }) === 0 &&
    safeEqual(password, credentials.password)
  );
}

export async function createDemoSession() {
  const credentials = getDemoCredentials();
  const payload = Buffer.from(
    JSON.stringify({
      id: "10000000-0000-4000-8000-000000000001",
      name: credentials.username,
      email: credentials.email,
      exp: Date.now() + 12 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getDemoUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthUser & { exp: number };
    if (data.exp < Date.now()) return null;
    return { id: data.id, name: data.name, email: data.email };
  } catch {
    return null;
  }
}
