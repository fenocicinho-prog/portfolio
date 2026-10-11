"use client";

import { useState, type ReactNode } from "react";
import MiniBrowser from "@/components/ui/MiniBrowser";

// Enveloppe la capture du projet : clic = ouvre le vrai site dans un mini-navigateur.
export default function ProjectDemo({ title, url, children }: { title: string; url?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  if (!url) return <>{children}</>;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full cursor-pointer text-left"
        aria-label={`Voir ${title} en direct`}
      >
        {children}
        <span className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-black/0 transition group-hover:bg-black/35 group-focus-visible:bg-black/35">
          <span className="rounded-full bg-accent px-4 py-2 text-base font-semibold text-on-accent opacity-90 shadow-lg transition group-hover:scale-105 group-hover:opacity-100">
            ▶ Voir en direct
          </span>
        </span>
      </button>
      {open && <MiniBrowser title={title} url={url} onClose={() => setOpen(false)} />}
    </>
  );
}
