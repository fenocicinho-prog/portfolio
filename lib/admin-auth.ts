import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

// L'admin n'existe que si ADMIN_PASSWORD est défini : sans lui, /admin reste fermé.
export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

const key = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (v: string) => createHmac("sha256", key()).update(v).digest("hex");

// Comparaison en temps constant (évite de deviner le mot de passe par le temps de réponse).
export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

// Jeton = date d'expiration + signature. Impossible à fabriquer sans le secret.
export function makeToken(): string {
  const exp = String(Date.now() + ADMIN_MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
