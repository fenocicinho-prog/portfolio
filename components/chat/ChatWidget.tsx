"use client";
import { useEffect, useRef, useState } from "react";
import { BotMark } from "@/components/ui/Icons";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { getSessionId } from "@/lib/session";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  async function send() {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), messages: next.slice(-6) }),
      });
      const d = await r.json();
      setMsgs([...next, { role: "assistant", content: d.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Je ne peux pas joindre l’assistant IA pour le moment. Vous pouvez consulter les sections CV, Projets et Services du portfolio. Pour une demande, contactez Cicinho sur WhatsApp ou via le formulaire." }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      {open && (
        <section aria-label="Chat avec l'assistant" className="fixed bottom-24 right-5 z-50 flex h-[28rem] max-h-[70vh] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border-2 border-accent bg-card text-fg shadow-2xl">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-2"><span className="text-accent"><BotMark size={30} /></span><strong>Assistant de {site.name}</strong></div>
            <button onClick={() => setOpen(false)} aria-label="Fermer le chat" className="rounded-lg px-2 py-1 text-xl leading-none hover:bg-line">×</button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.length === 0 && <p className="py-4 text-center text-sm text-muted">Posez une question sur le parcours, les projets ou les services de Cicinho.</p>}
            {msgs.map((m, i) => (
              <p key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-base ${m.role === "user" ? "ml-auto bg-accent text-on-accent" : "bg-line text-fg"}`}>{m.content}</p>
            ))}
            {busy && <p className="text-sm text-muted">L&apos;assistant écrit…</p>}
            <div ref={end} />
          </div>
          <p className="px-4 pb-1 text-xs text-muted">
            Réponses générées par une IA, elles peuvent contenir des erreurs. Les conversations sont enregistrées pour améliorer le service. Pour un devis :{" "}
            <a className="underline" href={waLink("Bonjour, j'aimerais un devis.")} target="_blank" rel="noopener noreferrer">WhatsApp</a>{" "}
            ou <a className="underline" href="#contact" onClick={() => setOpen(false)}>laissez vos coordonnées</a>.
          </p>
          <div className="flex gap-2 border-t border-line p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              maxLength={500} placeholder="Votre question…" aria-label="Votre question"
              className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-base text-fg" />
            <button onClick={send} disabled={busy} className="rounded-xl bg-[var(--lvl1)] px-4 font-semibold text-[var(--lvl1-fg)] disabled:opacity-50">Envoyer</button>
          </div>
        </section>
      )}
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat avec l'assistant"}
        className="fixed bottom-5 right-5 z-50 grid h-16 w-16 place-items-center rounded-full border-4 border-accent bg-card text-accent shadow-lg transition-transform hover:scale-105">
        <BotMark size={38} />
      </button>
    </>
  );
}
