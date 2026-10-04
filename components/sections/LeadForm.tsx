"use client";
import { useState } from "react";
import { CONSENT_TEXT } from "@/content/site";
import { getSessionId } from "@/lib/session";

type State = "idle" | "sending" | "done";

const field =
  "w-full rounded-xl border border-line bg-bg px-3 py-2 text-base text-fg placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-accent";

export default function LeadForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    setState("sending");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          whatsapp: f.get("whatsapp"),
          email: f.get("email"),
          message: f.get("message"),
          website: f.get("website"), // piège anti-robots
          consent: f.get("consent") === "on",
          sessionId: getSessionId(),
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setError(d.error ?? "Une erreur est survenue. Écrivez-moi sur WhatsApp.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Connexion impossible. Écrivez-moi sur WhatsApp.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-8 rounded-2xl border-2 border-accent bg-card p-6 text-lg">
        Merci ! Votre demande est bien reçue, je vous recontacte très vite.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-2xl gap-4 rounded-2xl border border-line bg-card p-6" noValidate>
      <label className="grid gap-1">
        <span className="font-semibold">Nom *</span>
        <input name="name" required maxLength={80} autoComplete="name" className={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="font-semibold">WhatsApp</span>
          <input name="whatsapp" type="tel" inputMode="tel" maxLength={25} autoComplete="tel" placeholder="+261 …" className={field} />
        </label>
        <label className="grid gap-1">
          <span className="font-semibold">E-mail</span>
          <input name="email" type="email" maxLength={120} autoComplete="email" className={field} />
        </label>
      </div>
      <p className="-mt-2 text-sm text-muted">Indiquez au moins l’un des deux.</p>
      <label className="grid gap-1">
        <span className="font-semibold">Votre projet (facultatif)</span>
        <textarea name="message" rows={3} maxLength={1000} className={field} />
      </label>

      {/* Champ piège : invisible pour les humains. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Site web <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-[var(--accent)]" />
        <span>{CONSENT_TEXT}</span>
      </label>

      {error && <p role="alert" className="font-semibold text-red">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="justify-self-start rounded-xl bg-[var(--lvl1)] px-6 py-3 font-semibold text-[var(--lvl1-fg)] transition-transform hover:scale-[1.03] disabled:opacity-50"
      >
        {state === "sending" ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
