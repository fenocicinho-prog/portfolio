import { NextResponse } from "next/server";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/content/site";
import { clientIp, dbEnabled, ensureSchema, hashIp, isSessionId, pool } from "@/lib/db";

const MAX_PER_HOUR = 5; // demandes par visiteur et par heure

const json = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json("Requête invalide.", 400); }

  // Anti-spam : ce champ est caché aux humains, les robots le remplissent.
  if (typeof b.website === "string" && b.website.trim() !== "") return NextResponse.json({ ok: true });

  // Le consentement est obligatoire.
  if (b.consent !== true) return json("Cochez la case pour confirmer votre accord.", 400);

  const name = String(b.name ?? "").trim().slice(0, 80);
  if (name.length < 2) return json("Indiquez votre nom.", 400);

  // WhatsApp : on garde chiffres et + initial (ex. +261 34 00 000 00 -> +261340000000)
  const waRaw = String(b.whatsapp ?? "").trim();
  const wa = waRaw.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
  if (wa && !/^\+?\d{8,15}$/.test(wa)) return json("Numéro WhatsApp invalide (avec l'indicatif, ex. +261…).", 400);

  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json("Adresse e-mail invalide.", 400);

  if (!wa && !email) return json("Indiquez au moins un WhatsApp ou un e-mail.", 400);

  const message = String(b.message ?? "").trim().slice(0, 1000);
  const sid = isSessionId(b.sessionId) ? b.sessionId : null;

  if (!dbEnabled()) return json("L'enregistrement est indisponible pour le moment. Écrivez-moi sur WhatsApp.", 503);

  try {
    await ensureSchema();
    const db = pool();
    const ipHash = hashIp(clientIp(req));
    const recent = await db.query(
      `select count(*)::int as n from leads where ip_hash = $1 and created_at > now() - interval '1 hour'`,
      [ipHash],
    );
    if ((recent.rows[0]?.n ?? 0) >= MAX_PER_HOUR) return json("Trop de demandes. Réessayez plus tard.", 429);

    await db.query(
      `insert into leads (session_id, name, whatsapp, email, message, consent, consent_text, consent_version, ip_hash)
       values ($1, $2, $3, $4, $5, true, $6, $7, $8)`,
      [sid, name, wa || null, email || null, message || null, CONSENT_TEXT, CONSENT_VERSION, ipHash],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("lead:", e);
    return json("Erreur serveur. Écrivez-moi sur WhatsApp.", 500);
  }
}
