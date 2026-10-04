"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import {
  IconServices, IconProjects, IconCV, IconContact,
  IconGitHub, IconFacebook, IconWhatsApp, IconMail,
} from "@/components/ui/Icons";

const contacts = [
  { href: site.github, label: "GitHub", Icon: IconGitHub, external: true },
  { href: site.facebook, label: "Facebook", Icon: IconFacebook, external: true },
  { href: waLink("Bonjour, j'aimerais discuter d'un projet."), label: "WhatsApp", Icon: IconWhatsApp, external: true },
  { href: `mailto:${site.email}`, label: "E-mail", Icon: IconMail, external: false },
];

const sections = [
  { href: "#services", label: "Services", Icon: IconServices },
  { href: "#projets", label: "Projets", Icon: IconProjects },
  { href: "#cv", label: "CV", Icon: IconCV },
  { href: "#contact", label: "Contact", Icon: IconContact },
];

const desktopLink =
  "flex items-center gap-2 rounded-full px-2.5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent focus-visible:outline-none sm:px-3";
const mobileLink =
  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent focus-visible:outline-none";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header id="top" className="sticky top-3 z-40 mt-3 px-3">
      <div className="mx-auto max-w-5xl rounded-[1.75rem] bg-linear-to-r from-accent-2 via-accent to-red p-[2px] shadow-lg">
        <div className="rounded-[1.65rem] bg-card p-2 sm:p-3">
          <div className="flex items-center justify-between gap-3 px-2 py-1 sm:px-3">
            <a href="#top" onClick={() => setMenuOpen(false)} className="shrink-0 font-display text-2xl italic text-fg">
              {site.name}
            </a>

            <nav aria-label="Menu principal" className="hidden items-center gap-0.5 lg:flex">
              {contacts.map(({ href, label, Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={desktopLink}
                >
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
              <span aria-hidden className="mx-1 h-6 w-px bg-line" />
              {sections.map(({ href, label, Icon }) => (
                <a key={href} href={href} className={desktopLink}>
                  <Icon />
                  <span>{label}</span>
                </a>
              ))}
            </nav>

            <button
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu principal" : "Ouvrir le menu principal"}
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>

          <nav
            id="mobile-navigation"
            aria-label="Navigation mobile"
            aria-hidden={!menuOpen}
            className={`${menuOpen ? "grid gap-4 border-t border-line pt-4" : "hidden"} lg:hidden`}
          >
            <div>
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted">Sections</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {sections.map(({ href, label, Icon }) => (
                  <a key={href} href={href} onClick={() => setMenuOpen(false)} className={mobileLink}>
                    <Icon />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="border-t border-line pt-3">
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted">Me contacter</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {contacts.map(({ href, label, Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={mobileLink}
                  >
                    <Icon />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
