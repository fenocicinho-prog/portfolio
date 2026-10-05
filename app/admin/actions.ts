"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminEnabled, isAdmin, makeToken, safeEqual } from "@/lib/admin-auth";
import { ensureSchema, pool } from "@/lib/db";

// Anti force-brute : 5 erreurs max par 15 minutes et par adresse IP (en mémoire).
const fails = new Map<string, { n: number; t: number }>();
const WINDOW = 15 * 60_000;
const MAX_FAILS = 5;

export async function login(formData: FormData) {
  if (!adminEnabled()) redirect("/admin");

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const f = fails.get(ip);
  if (f && now - f.t < WINDOW && f.n >= MAX_FAILS) redirect("/admin?e=wait");

  const password = String(formData.get("password") ?? "");
  if (!safeEqual(password, process.env.ADMIN_PASSWORD ?? "")) {
    fails.set(ip, f && now - f.t < WINDOW ? { n: f.n + 1, t: f.t } : { n: 1, t: now });
    redirect("/admin?e=bad");
  }

  fails.delete(ip);
  (await cookies()).set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0 });
  redirect("/admin");
}

// Chaque action revérifie la session : un appel direct sans être connecté ne fait rien.
export async function setHandled(id: number, handled: boolean) {
  if (!(await isAdmin())) return;
  await ensureSchema();
  await pool().query("update leads set handled = $2 where id = $1", [id, handled]);
  revalidatePath("/admin");
}

export async function deleteLead(id: number) {
  if (!(await isAdmin())) return;
  await ensureSchema();
  await pool().query("delete from leads where id = $1", [id]);
  revalidatePath("/admin");
}
