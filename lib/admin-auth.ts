import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "portfolio_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;
const ADMIN_SESSION_TTL_MS = ADMIN_SESSION_TTL_SECONDS * 1000;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function signingKey() {
  return createHash("sha256").update(`${sessionSecret()}\0${process.env.ADMIN_PASSWORD ?? ""}`).digest();
}

export function adminAuthConfigured() {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 16 && sessionSecret().length >= 32;
}

function constantTimeTextEqual(left: string, right: string) {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

export function adminPasswordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!adminAuthConfigured() || candidate.length > 256) return false;
  return constantTimeTextEqual(candidate, expected);
}

export function createAdminSessionToken(now = Date.now()) {
  if (!adminAuthConfigured()) return null;
  const expiresAt = String(now + ADMIN_SESSION_TTL_MS);
  const signature = createHmac("sha256", signingKey()).update(expiresAt).digest("base64url");
  return `${expiresAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined, now = Date.now()) {
  if (!token || !adminAuthConfigured()) return false;
  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra !== undefined || !/^\d+$/.test(expiresAt)) return false;
  const expiry = Number(expiresAt);
  if (!Number.isSafeInteger(expiry) || expiry <= now || expiry > now + ADMIN_SESSION_TTL_MS + 60_000) return false;
  const expected = createHmac("sha256", signingKey()).update(expiresAt).digest("base64url");
  return constantTimeTextEqual(signature, expected);
}

export async function isAdminAuthorized() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}
