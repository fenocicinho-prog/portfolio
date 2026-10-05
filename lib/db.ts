import { Pool } from "pg";
import { createHash } from "node:crypto";

// Connexion PostgreSQL (Neon, Supabase, Vercel Postgres… n'importe quelle URL Postgres).
// Sans DATABASE_URL, le site fonctionne quand même : rien n'est enregistré.
const g = globalThis as unknown as { __pool?: Pool; __schema?: Promise<void>; __downUntil?: number };

export const dbEnabled = () => Boolean(process.env.DATABASE_URL);

export function pool(): Pool {
  if (!g.__pool) {
    g.__pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 5000 });
  }
  return g.__pool;
}

const SCHEMA = `
create table if not exists chat_sessions (
  id text primary key,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
create table if not exists chat_messages (
  id bigserial primary key,
  session_id text not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_session_idx on chat_messages (session_id, created_at);
create table if not exists leads (
  id bigserial primary key,
  session_id text,
  name text not null,
  whatsapp text,
  email text,
  message text,
  consent boolean not null,
  consent_text text not null,
  consent_version text not null,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists leads_ip_idx on leads (ip_hash, created_at);
alter table leads add column if not exists handled boolean not null default false;
`;

// Crée les tables au premier appel (une seule fois par instance du serveur).
export function ensureSchema(): Promise<void> {
  if (g.__schema) return g.__schema;
  const run: Promise<void> = pool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((e: unknown) => {
      g.__schema = undefined; // réessaiera au prochain appel
      throw e;
    });
  g.__schema = run;
  return run;
}

// IP jamais stockée en clair : seulement un hash salé (sert à limiter les abus).
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "change-me";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export const isSessionId = (v: unknown): v is string =>
  typeof v === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(v);

// Enregistre un message de chat. N'échoue jamais : un souci de base de données ne doit pas casser le bot.
// Si la base est injoignable, on la laisse tranquille 60 s au lieu de faire attendre chaque message.
export async function logChat(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
  meta?: { ipHash?: string; userAgent?: string },
): Promise<void> {
  if (!dbEnabled() || Date.now() < (g.__downUntil ?? 0)) return;
  try {
    await ensureSchema();
    const db = pool();
    await db.query(
      `insert into chat_sessions (id, ip_hash, user_agent) values ($1, $2, $3)
       on conflict (id) do update set last_message_at = now()`,
      [sessionId, meta?.ipHash ?? null, meta?.userAgent?.slice(0, 200) ?? null],
    );
    await db.query(
      `insert into chat_messages (session_id, role, content) values ($1, $2, $3)`,
      [sessionId, role, content.slice(0, 2000)],
    );
  } catch (e) {
    g.__downUntil = Date.now() + 60_000;
    const err = e as { code?: string; message?: string; errors?: { code?: string }[] };
    console.error("logChat: base injoignable ou erreur SQL :", err.code ?? err.errors?.[0]?.code ?? err.message);
  }
}
