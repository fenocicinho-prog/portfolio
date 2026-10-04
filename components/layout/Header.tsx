"use client";

import { useEffect, useState, type MouseEvent } from "react";
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
  "group flex h-11 items-center justify-center rounded-full px-3 text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent focus-visible:outline-none";
const desktopLabel =
  "max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-28 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-28 group-focus-visible:opacity-100";
const mobileLink =
  "group relative flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-accent transition-all hover:bg-accent hover:text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMobileLabel, setSelectedMobileLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSelectedMobileLabel(null);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function handleMobileLinkClick(event: MouseEvent<HTMLAnchorElement>, label: string) {
    // Au toucher, le premier appui ne navigue pas : il révèle le libellé.
    // Le second appui ouvre la destination. Le clavier et les lecteurs d’écran
    // naviguent directement, sans imposer une étape supplémentaire.
    if (event.detail !== 0 && selectedMobileLabel !== label) {
      event.preventDefault();
      setSelectedMobileLabel(label);
      return;
    }
    setMenuOpen(false);
    setSelectedMobileLabel(null);
  }

  function renderMobileLink(
    href: string,
    label: string,
    Icon: typeof IconGitHub,
    external = false,
  ) {
    const selected = selectedMobileLabel === label;
    return (
      <a
        key={label}
        href={href}
        title={label}
        aria-label={label}
        onClick={(event) => handleMobileLinkClick(event, label)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${mobileLink} ${selected ? "col-span-2 justify-start bg-accent text-on-accent" : "justify-self-center"}`}
      >
        <Icon />
        <span className={`${selected ? "max-w-32 opacity-100" : "max-w-0 opacity-0 group-focus-visible:max-w-32 group-focus-visible:opacity-100"} overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-200`}>
          {label}
        </span>
      </a>
    );
  }

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
                  aria-label={label}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={desktopLink}
                >
                  <Icon />
                  <span className={desktopLabel}>{label}</span>
                </a>
              ))}
              <span aria-hidden className="mx-1 h-6 w-px bg-line" />
              {sections.map(({ href, label, Icon }) => (
                <a key={href} href={href} title={label} aria-label={label} className={desktopLink}>
                  <Icon />
                  <span className={desktopLabel}>{label}</span>
                </a>
              ))}
            </nav>

            <button
              type="button"
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu principal" : "Ouvrir le menu principal"}
              onClick={() => {
                setMenuOpen((open) => !open);
                setSelectedMobileLabel(null);
              }}
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
            className={`${menuOpen ? "grid gap-3 border-t border-line pt-4" : "hidden"} lg:hidden`}
          >
            <p aria-live="polite" className="sr-only">
              {selectedMobileLabel ? `${selectedMobileLabel}. Appuyez une nouvelle fois pour ouvrir.` : ""}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {sections.map(({ href, label, Icon }) => renderMobileLink(href, label, Icon))}
            </div>
            <div className="border-t border-line pt-3">
              <div className="grid grid-cols-4 gap-2">
                {contacts.map(({ href, label, Icon, external }) => renderMobileLink(href, label, Icon, external))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
