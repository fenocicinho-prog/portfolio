export type Project = {
  slug: string;
  title: string;
  kind: "realise" | "en-cours" | "demo";
  summary: string;
  stack: string[];
  cover?: string; // ex: "/projects/mini-copilot/cover.webp"
  video?: string; // ex: "/projects/mini-copilot/demo.mp4"
  link?: string;
};

export const projects: Project[] = [
  {
    slug: "ny-herin-ny-boky",
    title: "Ny Herin ny Boky",
    kind: "realise",
    summary:
      "Marketplace de vente et de location de livres pour Madagascar : catalogue, panier, tableau de bord vendeur, paiement par carte ou Mobile Money (lien USSD guidé).",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Prisma", "PostgreSQL"],
    cover: "/projects/ny-herin-ny-boky/ny-herin-ny-boky.png"
  },
  {
    slug: "mini-copilot",
    title: "Mini Copilot",
    kind: "realise",
    summary:
      "Assistant IA pour développeurs, en version web et mobile : connexion Google, quota quotidien, modèles accessibles via OpenRouter.",
    stack: ["Expo", "Prisma", "PostgreSQL", "Vercel", "GitHub Actions"],
    cover: "/projects/mini-copilot/mini-copilot.png"
  },
  {
    slug: "agent-desktop",
    title: "Agent ordinateur",
    kind: "en-cours",
    summary:
      "Le moteur de la version ordinateur : lit des fichiers, en crée et propose des idées. Écrit en Python, réécriture en Dart en cours.",
    stack: ["Python", "Dart"],
    cover: "/projects/agent-desktop/agent-desktop.png"
  },
  {
    slug: "demo-hotel",
    title: "Démo : site d'hôtel",
    kind: "demo",
    summary: "Démonstration fictive : chambres, galerie, réservation par WhatsApp.",
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-hotel/demo-hotel.png"
  },
  {
    slug: "demo-restaurant",
    title: "Démo : site de restaurant",
    kind: "demo",
    summary: "Démonstration fictive : menu, galerie, carte, réservation par WhatsApp.",
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-restaurant/demo-restaurant.png"
  },
];
