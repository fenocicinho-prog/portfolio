"use client";

import { useEffect, useRef, useState } from "react";

type Props = { title: string; url: string; onClose: () => void };

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

// Fenêtre de navigateur factice : affiche le vrai site dans une iframe.
export default function MiniBrowser({ title, url, onClose }: Props) {
  const [mobile, setMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const btn =
    "grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-line/60 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu en direct : ${title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre du navigateur */}
        <div className="flex items-center gap-2 border-b border-line bg-bg px-3 py-2">
          <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-full border border-line bg-card px-3 py-1 text-center text-sm text-muted">
            🔒 {hostOf(url)}
          </div>
          <button
            type="button"
            className={`${btn} hidden sm:grid`}
            onClick={() => setMobile((m) => !m)}
            aria-pressed={mobile}
            title={mobile ? "Affichage ordinateur" : "Affichage mobile"}
          >
            <span aria-hidden="true">{mobile ? "🖥" : "📱"}</span>
            <span className="sr-only">{mobile ? "Affichage ordinateur" : "Affichage mobile"}</span>
          </button>
          <button
            type="button"
            className={btn}
            onClick={() => {
              setLoaded(false);
              setReloadKey((k) => k + 1);
            }}
            title="Recharger"
          >
            <span aria-hidden="true">↻</span>
            <span className="sr-only">Recharger</span>
          </button>
          <a href={url} target="_blank" rel="noopener noreferrer" className={btn} title="Ouvrir dans un nouvel onglet">
            <span aria-hidden="true">↗</span>
            <span className="sr-only">Ouvrir dans un nouvel onglet</span>
          </a>
          <button ref={closeRef} type="button" className={btn} onClick={onClose} title="Fermer (Échap)">
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Fermer</span>
          </button>
        </div>

        {/* Page */}
        <div className="relative flex-1 overflow-auto bg-[#f4f4f4] dark:bg-[#1a1f1c]">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center text-sm text-muted">Chargement de {hostOf(url)}…</div>
          )}
          <iframe
            key={reloadKey}
            src={url}
            title={`Aperçu de ${title}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            className={`mx-auto block h-full border-0 bg-white transition-all ${mobile ? "w-[390px] max-w-full shadow-lg" : "w-full"}`}
          />
        </div>
        <p className="border-t border-line bg-bg px-3 py-1.5 text-center text-xs text-muted">
          Site en direct : tu peux cliquer et naviguer. Si rien ne s&apos;affiche,{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
            ouvre-le dans un nouvel onglet
          </a>
          .
        </p>
      </div>
    </div>
  );
}
