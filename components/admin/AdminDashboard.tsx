"use client";
import { useCallback, useEffect, useState } from "react";

type Lead = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  message: string | null;
  createdAt: string;
};

type View = "loading" | "login" | "dashboard" | "unconfigured" | "error";
const button = "rounded-xl bg-[var(--lvl1)] px-4 py-2.5 font-semibold text-[var(--lvl1-fg)] transition hover:opacity-90 disabled:opacity-50";
const field = "w-full rounded-xl border border-line bg-bg px-3 py-3 text-base text-fg focus-visible:outline-2 focus-visible:outline-accent";

export default function AdminDashboard({ configured }: { configured: boolean }) {
  const [view, setView] = useState<View>(configured ? "loading" : "unconfigured");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { setView("login"); return; }
      if (!response.ok) {
        setError(data.error ?? "Le chargement a échoué.");
        setView(response.status === 503 && !configured ? "unconfigured" : "error");
        return;
      }
      setLeads(data.leads ?? []);
      setView("dashboard");
      setError("");
    } catch {
      setError("Connexion impossible. Réessayez.");
      setView("error");
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) return;
    const timer = window.setTimeout(() => { void loadLeads(); }, 0);
    return () => window.clearTimeout(timer);
  }, [configured, loadLeads]);

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Connexion refusée.");
        return;
      }
      setPassword("");
      await loadLeads();
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLeads([]);
    setView("login");
  }

  const panel = "mx-auto max-w-5xl rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8";
  if (view === "loading") return <main className="mx-auto max-w-5xl px-5 py-16" aria-live="polite">Chargement…</main>;

  if (view === "unconfigured") return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <section className={panel}>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Administration privée</p>
        <h1 className="mt-2 text-3xl font-bold">Configuration requise</h1>
        <p className="mt-4 text-muted">L’accès admin n’est pas activé. Définissez les variables <code>ADMIN_PASSWORD</code> et <code>ADMIN_SESSION_SECRET</code> sur l’hébergeur, puis redéployez le site.</p>
      </section>
    </main>
  );

  if (view === "login") return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <section className={panel}>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Administration privée</p>
        <h1 className="mt-2 text-3xl font-bold">Demandes de contact</h1>
        <p className="mt-3 text-muted">Connectez-vous pour consulter les demandes reçues. Ne partagez pas le mot de passe admin.</p>
        <form onSubmit={onLogin} className="mt-7 grid gap-4">
          <label className="grid gap-2 font-semibold" htmlFor="admin-password">Mot de passe administrateur
            <input id="admin-password" type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} className={field} />
          </label>
          {error && <p role="alert" className="font-semibold text-red">{error}</p>}
          <button disabled={busy} className={button} type="submit">{busy ? "Connexion…" : "Se connecter"}</button>
        </form>
      </section>
    </main>
  );

  if (view === "error") return (
    <main className="mx-auto max-w-5xl px-5 py-16"><section className={panel}>
      <h1 className="text-3xl font-bold">Demandes indisponibles</h1>
      <p role="alert" className="mt-4 text-red">{error}</p>
      <button onClick={() => void loadLeads()} className={`${button} mt-6`}>Réessayer</button>
    </section></main>
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Administration privée</p>
            <h1 className="mt-2 text-3xl font-bold">Demandes de contact</h1>
            <p className="mt-2 text-muted">Les {leads.length === 100 ? "100 dernières" : leads.length} demandes les plus récentes.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void loadLeads()} className={button}>Actualiser</button>
            <button onClick={() => void onLogout()} className="rounded-xl border border-line px-4 py-2.5 font-semibold hover:bg-bg">Déconnexion</button>
          </div>
        </div>
        {leads.length === 0 ? <p className="mt-8 rounded-xl border border-line p-5 text-muted">Aucune demande reçue pour le moment.</p> : (
          <div className="mt-7 grid gap-4">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-xl border border-line p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-bold">{lead.name}</h2>
                  <time className="text-sm text-muted" dateTime={lead.createdAt}>{new Date(lead.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</time>
                </div>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {lead.whatsapp && <a className="text-accent underline" href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}>WhatsApp : {lead.whatsapp}</a>}
                  {lead.email && <a className="text-accent underline" href={`mailto:${encodeURIComponent(lead.email)}`}>{lead.email}</a>}
                  <span className="text-muted">Demande #{lead.id}</span>
                </p>
                {lead.message && <p className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-bg p-4">{lead.message}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
