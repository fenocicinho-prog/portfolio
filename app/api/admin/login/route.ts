import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { clientIp } from "@/lib/db";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  adminAuthConfigured,
  adminPasswordMatches,
  createAdminSessionToken,
  isSameOriginRequest,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = globalThis as typeof globalThis & { __adminLoginAttempts?: Map<string, { count: number; until: number }> };
const loginAttempts = (attempts.__adminLoginAttempts ??= new Map());

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Requête refusée." }, { status: 403 });
  if (!adminAuthConfigured()) return NextResponse.json({ error: "L’accès admin n’est pas encore configuré." }, { status: 503 });

  const ipKey = createHash("sha256").update(clientIp(request)).digest("hex");
  const now = Date.now();
  for (const [key, value] of loginAttempts) if (value.until <= now) loginAttempts.delete(key);
  const entry = loginAttempts.get(ipKey);
  if (entry && entry.count >= MAX_ATTEMPTS && entry.until > now) {
    return NextResponse.json({ error: "Trop d’essais. Réessayez dans 15 minutes." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  const password = typeof body === "object" && body !== null && "password" in body && typeof body.password === "string"
    ? body.password
    : "";

  if (!adminPasswordMatches(password)) {
    const current = loginAttempts.get(ipKey);
    const active = current?.until && current.until > now;
    loginAttempts.set(ipKey, { count: active ? current.count + 1 : 1, until: active ? current.until : now + WINDOW_MS });
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  loginAttempts.delete(ipKey);
  const token = createAdminSessionToken();
  if (!token) return NextResponse.json({ error: "L’accès admin n’est pas configuré." }, { status: 503 });
  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return response;
}
