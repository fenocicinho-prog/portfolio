export type Project = {
  slug: string;
  title: string;
  kind: "realise" | "en-cours" | "demo";
  summary: string;
  stack: string[];
  cover?: string; // ex: "/projects/mini-copilot/mini-copilot.png"
  video?: string; // ex: "/projects/mini-copilot/demo.mp4"
  link?: string;
  /**
   * Adresse du vrai site en ligne (ex. "https://mon-projet.vercel.app").
   * Si elle est renseignée, un bouton "Voir en direct" ouvre le site dans un mini-navigateur.
   * Laisse vide tant que le site n'est pas déployé : le bouton n'apparaît pas.
   */
  demoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "ny-herin-ny-boky",
    title: "Ny Herin ny Boky",
    kind: "realise",
    summary:
      "Marketplace de vente et de location de livres pour Madagascar : catalogue, panier, tableau de bord vendeur, paiement par carte ou Mobile Money (lien USSD guidé).",
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Prisma", "PostgreSQL"],
    cover: "/projects/ny-herin-ny-boky/ny-herin-ny-boky.png",
    demoUrl: "https://ny-erin-ny-boky.com", // TODO : adresse .vercel.app du site Ny Herin ny Boky
  },
  {
    slug: "muller-home-remodeling",
    title: "Muller Home Remodeling",
    kind: "realise",
    summary:
      "Site vitrine pour une entreprise de rénovation en Californie : services, galeries photo par catégorie, formulaire de devis et boutons d'appel direct.",
    stack: ["Next.js", "React", "TypeScript", "Tailwind"],
    cover: "/projects/muller-home/muller-home.png", // ← ajoute la capture puis décommente
    demoUrl: "https://muller-home-remodeling.vercel.app/", // TODO : adresse .vercel.app du site Muller
  },
  {
    slug: "mini-copilot",
    title: "Mini Copilot",
    kind: "realise",
    summary:
      "Assistant IA pour développeurs, en version web et mobile : connexion Google, quota quotidien, modèles accessibles via OpenRouter.",
    stack: ["Expo", "Prisma", "PostgreSQL", "Vercel", "GitHub Actions"],
    cover: "/projects/mini-copilot/mini-copilot.png",
    demoUrl: "https://mini-copilot-api.vercel.app", // TODO : adresse .vercel.app du site Mini Copilot
  },
  {
    slug: "social-bot",
    title: "Bot Messenger & publications Facebook",
    kind: "realise",
    summary:
      "Bot IA qui répond aux clients sur Messenger et publie automatiquement des annonces illustrées sur une Page Facebook, 24 h/24 sans que mon ordinateur soit allumé.",
    stack: ["Next.js", "Vercel", "Meta API", "OpenRouter"],
    cover: "/projects/social-bot/social-bot.png", // ← ajoute la capture puis décommente
    demoUrl: "https://social-bot-beta.vercel.app/",
  },
  {
    slug: "agent-desktop",
    title: "Agent ordinateur",
    kind: "en-cours",
    summary:
      "Le moteur de la version ordinateur : lit des fichiers, en crée et propose des idées. Écrit en Python, réécriture en Dart en cours.",
    stack: ["Python", "Dart"],
    cover: "/projects/agent-desktop/agent-desktop.png",
  },
  {
    slug: "demo-hotel",
    title: "Démo : site d'hôtel",
    kind: "demo",
    summary: "Démonstration fictive : chambres, galerie, réservation par WhatsApp.",
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-hotel/demo-hotel.png",
    demoUrl: "", // TODO : adresse .vercel.app de la démo hôtel
  },
  {
    slug: "demo-restaurant",
    title: "Démo : site de restaurant",
    kind: "demo",
    summary: "Démonstration fictive : menu, galerie, carte, réservation par WhatsApp.",
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-restaurant/demo-restaurant.png",
    demoUrl: "", // TODO : adresse .vercel.app de la démo restaurant
  },
];
