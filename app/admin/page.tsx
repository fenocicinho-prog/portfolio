import type { Metadata } from "next";
import { adminEnabled, isAdmin } from "@/lib/admin-auth";
import { dbEnabled, ensureSchema, pool } from "@/lib/db";
import { deleteLead, login, logout, setHandled } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Lead = {
  id: number; name: string; whatsapp: string | null; email: string | null;
  message: string | null; handled: boolean; created_at: Date;
};
type Session = { id: string; created_at: Date; last_message_at: Date; n: number };
type Msg = { session_id: string; role: "user" | "assistant"; content: string; created_at: Date };

const fmt = (d: Date) =>
  new Date(d).toLocaleString("fr-FR", { timeZone: "Indian/Antananarivo", dateStyle: "short", timeStyle: "short" });

const field =
  "w-full rounded-xl border border-line bg-bg px-3 py-2 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent";
const btn = "rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent hover:text-on-accent";

const ERRORS: Record<string, string> = {
  bad: "Mot de passe incorrect.",
  wait: "Trop d'essais. Réessayez dans 15 minutes.",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;

  if (!adminEnabled()) {
    return (
      <Shell>
        <p className="rounded-2xl border border-line bg-card p-6">
          L&apos;admin est désactivé. Ajoute la variable d&apos;environnement <code>ADMIN_PASSWORD</code> puis redéploie.
        </p>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <form action={login} className="grid max-w-sm gap-4 rounded-2xl border border-line bg-card p-6">
          <label className="grid gap-1">
            <span className="font-semibold">Mot de passe</span>
            <input name="password" type="password" required autoFocus autoComplete="current-password" className={field} />
          </label>
          {e && ERRORS[e] && <p role="alert" className="font-semibold text-red">{ERRORS[e]}</p>}
          <button type="submit" className="justify-self-start rounded-xl bg-[var(--lvl1)] px-6 py-3 font-semibold text-[var(--lvl1-fg)]">
            Se connecter
          </button>
        </form>
      </Shell>
    );
  }

  let leads: Lead[] = [];
  let sessions: Session[] = [];
  let msgs: Msg[] = [];
  let dbError = !dbEnabled() ? "DATABASE_URL n'est pas défini : rien n'est enregistré." : "";

  if (!dbError) {
    try {
      await ensureSchema();
      const db = pool();
      leads = (await db.query<Lead>(
        "select id, name, whatsapp, email, message, handled, created_at from leads order by created_at desc limit 200",
      )).rows;
      sessions = (await db.query<Session>(
        `select s.id, s.created_at, s.last_message_at, count(m.id)::int as n
           from chat_sessions s left join chat_messages m on m.session_id = s.id
          group by s.id order by s.last_message_at desc limit 30`,
      )).rows;
      if (sessions.length) {
        msgs = (await db.query<Msg>(
          "select session_id, role, content, created_at from chat_messages where session_id = any($1) order by created_at",
          [sessions.map((s) => s.id)],
        )).rows;
      }
    } catch (err) {
      console.error("admin:", err);
      dbError = "Impossible de lire la base de données.";
    }
  }

  const todo = leads.filter((l) => !l.handled).length;

  return (
    <Shell
      right={
        <form action={logout}>
          <button className={btn}>Se déconnecter</button>
        </form>
      }
    >
      {dbError && <p role="alert" className="mb-6 rounded-2xl border-2 border-red bg-card p-4 font-semibold text-red">{dbError}</p>}

      <h2 className="font-display text-3xl italic">
        Demandes <span className="text-base not-italic text-muted">({todo} à traiter sur {leads.length})</span>
      </h2>

      {leads.length === 0 && !dbError && <p className="mt-4 text-muted">Aucune demande pour le moment.</p>}

      <ul className="mt-4 grid gap-3">
        {leads.map((l) => (
          <li key={l.id} className={`rounded-2xl border bg-card p-4 ${l.handled ? "border-line opacity-70" : "border-accent"}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-lg font-semibold">{l.name}</p>
              <p className="text-sm text-muted">{fmt(l.created_at)}</p>
            </div>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {l.whatsapp && (
                <a className="font-semibold text-accent underline" target="_blank" rel="noopener noreferrer"
                   href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}>
                  WhatsApp {l.whatsapp}
                </a>
              )}
              {l.email && <a className="font-semibold text-accent underline" href={`mailto:${l.email}`}>{l.email}</a>}
            </p>
            {l.message && <p className="mt-2 whitespace-pre-wrap">{l.message}</p>}
            <div className="mt-3 flex gap-2">
              <form action={setHandled.bind(null, l.id, !l.handled)}>
                <button className={btn}>{l.handled ? "Remettre à traiter" : "Marquer comme traité"}</button>
              </form>
              <form action={deleteLead.bind(null, l.id)}>
                <button className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-red hover:bg-red hover:text-white">
                  Supprimer
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 font-display text-3xl italic">Conversations du chat</h2>
      {sessions.length === 0 && !dbError && <p className="mt-4 text-muted">Aucune conversation.</p>}
      <div className="mt-4 grid gap-2">
        {sessions.map((s) => (
          <details key={s.id} className="rounded-2xl border border-line bg-card p-4">
            <summary className="cursor-pointer font-semibold">
              {fmt(s.last_message_at)} <span className="font-normal text-muted">· {s.n} message{s.n > 1 ? "s" : ""}</span>
            </summary>
            <ul className="mt-3 grid gap-2 text-sm">
              {msgs.filter((m) => m.session_id === s.id).map((m, i) => (
                <li key={i} className={m.role === "user" ? "font-semibold" : "text-muted"}>
                  {m.role === "user" ? "Visiteur : " : "Bot : "}
                  {m.content}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between gap-3">
        <h1 className="font-display text-4xl italic">Admin</h1>
        {right}
      </div>
      {children}
    </main>
  );
}
