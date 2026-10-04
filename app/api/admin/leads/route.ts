import { NextResponse } from "next/server";
import { adminAuthConfigured, isAdminAuthorized } from "@/lib/admin-auth";
import { dbEnabled, ensureSchema, pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET() {
  if (!adminAuthConfigured()) return NextResponse.json({ error: "L’accès admin n’est pas encore configuré." }, { status: 503, headers: privateHeaders });
  if (!await isAdminAuthorized()) return NextResponse.json({ error: "Authentification requise." }, { status: 401, headers: privateHeaders });
  if (!dbEnabled()) return NextResponse.json({ error: "La base de données n’est pas configurée." }, { status: 503, headers: privateHeaders });

  try {
    await ensureSchema();
    const result = await pool().query(
      `select id::text, name, whatsapp, email, message, created_at
       from leads order by created_at desc limit 100`,
    );
    const leads = result.rows.map((row) => ({
      id: String(row.id),
      name: String(row.name),
      whatsapp: row.whatsapp ? String(row.whatsapp) : null,
      email: row.email ? String(row.email) : null,
      message: row.message ? String(row.message) : null,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    }));
    return NextResponse.json({ leads }, { headers: privateHeaders });
  } catch (error) {
    console.error("admin leads query failed", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Impossible de charger les demandes." }, { status: 503, headers: privateHeaders });
  }
}
