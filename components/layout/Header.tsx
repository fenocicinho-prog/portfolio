import { site } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import {
  IconServices, IconProjects, IconCV, IconContact,
  IconGitHub, IconFacebook, IconWhatsApp, IconMail,
} from "@/components/ui/Icons";

// Liens de contact (en premier dans le menu : GitHub d'abord).
const contacts = [
  { href: site.github, label: "GitHub", Icon: IconGitHub, external: true },
  { href: site.facebook, label: "Facebook", Icon: IconFacebook, external: true },
  { href: waLink("Bonjour, j'aimerais discuter d'un projet."), label: "WhatsApp", Icon: IconWhatsApp, external: true },
  { href: `mailto:${site.email}`, label: "E-mail", Icon: IconMail, external: false },
];

// Sections de la page.
const sections = [
  { href: "#services", label: "Services", Icon: IconServices, external: false },
  { href: "#projets", label: "Projets", Icon: IconProjects, external: false },
  { href: "#cv", label: "CV", Icon: IconCV, external: false },
  { href: "#contact", label: "Contact", Icon: IconContact, external: false },
];

const item =
  "group flex items-center rounded-full px-2.5 py-2 text-accent transition-colors hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent focus-visible:outline-none active:bg-accent active:text-on-accent sm:px-3";
const labelCls =
  "max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:max-w-28 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-28 group-focus-visible:opacity-100 group-active:ml-2 group-active:max-w-28 group-active:opacity-100";

export default function Header() {
  return (
    <header className="sticky top-3 z-40 mt-3 px-3">
      <div className="mx-auto max-w-5xl rounded-[1.75rem] bg-linear-to-r from-accent-2 via-accent to-red p-[2px] shadow-lg sm:rounded-full">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[1.65rem] bg-card px-4 py-2 sm:justify-between sm:rounded-full sm:px-5">
          <a href="#" className="font-display text-2xl italic text-fg">{site.name}</a>
          <nav aria-label="Menu principal" className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1">
            {contacts.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={item}
              >
                <Icon />
                <span className={labelCls}>{label}</span>
              </a>
            ))}
            <span aria-hidden className="mx-1 h-6 w-px bg-line" />
            {sections.map(({ href, label, Icon }) => (
              <a key={href} href={href} aria-label={label} title={label} className={item}>
                <Icon />
                <span className={labelCls}>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
