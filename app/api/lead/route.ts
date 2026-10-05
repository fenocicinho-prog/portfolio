import { NextResponse } from "next/server";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/content/site";
import { clientIp, dbEnabled, ensureSchema, hashIp, isSessionId, pool } from "@/lib/db";
import { leadMessage, sendTelegram, telegramEnabled } from "@/lib/telegram";

const MAX_PER_HOUR = 5; // demandes par visiteur et par heure

const json = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

// Limite en mémoire : sert de filet si la base est injoignable (et évite de te spammer sur Telegram).
const recentHits = new Map<string, number[]>();
function tooMany(ipHash: string): boolean {
  const since = Date.now() - 3_600_000;
  const hits = (recentHits.get(ipHash) ?? []).filter((t) => t > since);
  if (hits.length >= MAX_PER_HOUR) { recentHits.set(ipHash, hits); return true; }
  hits.push(Date.now());
  recentHits.set(ipHash, hits);
  return false;
}

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

  // Il faut au moins un des deux : la base de données ou Telegram.
  if (!dbEnabled() && !telegramEnabled()) {
    return json("L'enregistrement est indisponible pour le moment. Écrivez-moi sur WhatsApp.", 503);
  }

  const ipHash = hashIp(clientIp(req));
  if (tooMany(ipHash)) return json("Trop de demandes. Réessayez plus tard.", 429);

  // 1) Enregistrement en base (pour la page admin).
  let saved = false;
  if (dbEnabled()) {
    try {
      await ensureSchema();
      const db = pool();
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
      saved = true;
    } catch (e) {
      console.error("lead:", e);
    }
  }

  // 2) Alerte Telegram, même si tu n'es pas connecté à l'admin (et même si la base est en panne).
  const notified = await sendTelegram(leadMessage({ name, whatsapp: wa || null, email: email || null, message: message || null, saved }));

  if (!saved && !notified) return json("Erreur serveur. Écrivez-moi sur WhatsApp.", 500);
  return NextResponse.json({ ok: true });
}
