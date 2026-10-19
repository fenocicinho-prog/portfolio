export type Project = {
  slug: string;
  title: string;
  kind: "realise" | "en-cours" | "demo";
  summary: string;
  features: string[];
  stack: string[];
  cover?: string;
  video?: string;
  link?: string;
  /** Adresse publique du site ou de la démonstration, si disponible. */
  demoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "ny-herin-ny-boky",
    title: "Ny Herin ny Boky",
    kind: "realise",
    summary:
      "Marketplace malagasy de vente et de location de livres, avec catalogue, panier, espace vendeur et paiements par carte ou Mobile Money via un parcours USSD guidé.",
    features: [
      "Catalogue de livres proposés à la vente ou à la location.",
      "Parcours d’achat avec panier.",
      "Tableau de bord dédié aux vendeurs.",
      "Paiement par carte ou Mobile Money avec lien USSD guidé.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind", "Prisma", "PostgreSQL"],
    cover: "/projects/ny-herin-ny-boky/ny-herin-ny-boky.png",
    demoUrl: "https://ny-erin-ny-boky.com",
  },
  {
    slug: "muller-home-remodeling",
    title: "Muller Home Remodeling",
    kind: "realise",
    summary:
      "Site vitrine pour une entreprise de rénovation en Californie, présentant ses services et ses galeries photo, avec demande de devis et appel direct.",
    features: [
      "Présentation des services de rénovation.",
      "Galeries photo classées par catégorie.",
      "Formulaire de demande de devis.",
      "Boutons d’appel direct vers l’entreprise.",
    ],
    stack: ["Next.js", "React", "TypeScript", "Tailwind"],
    cover: "/projects/muller-home/muller-home.png",
    demoUrl: "https://muller-home-remodeling.vercel.app/",
  },
  {
    slug: "mini-copilot",
    title: "Mini Copilot",
    kind: "realise",
    summary:
      "Assistant IA pour développeurs disponible en versions web et mobile, avec connexion Google, quota quotidien et modèles accessibles via OpenRouter.",
    features: [
      "Interface d’assistant IA destinée aux développeurs.",
      "Versions web et mobile.",
      "Connexion avec un compte Google.",
      "Quota d’utilisation quotidien et accès aux modèles via OpenRouter.",
    ],
    stack: ["Expo", "Prisma", "PostgreSQL", "Vercel", "GitHub Actions"],
    cover: "/projects/mini-copilot/mini-copilot.png",
    demoUrl: "https://mini-copilot-api.vercel.app",
  },
  {
    slug: "social-bot",
    title: "Bot Messenger & publications Facebook",
    kind: "realise",
    summary:
      "Bot IA qui répond aux clients sur Messenger et publie automatiquement des annonces illustrées sur une Page Facebook, sans nécessiter un ordinateur allumé.",
    features: [
      "Réponses automatisées aux messages clients reçus sur Messenger.",
      "Publications d’annonces accompagnées d’illustrations sur une Page Facebook.",
      "Exécution continue sur Vercel, sans dépendre d’un ordinateur personnel allumé.",
    ],
    stack: ["Next.js", "Vercel", "Meta API", "OpenRouter"],
    cover: "/projects/social-bot/social-bot.png",
    demoUrl: "https://social-bot-beta.vercel.app/",
  },
  {
    slug: "agent-desktop",
    title: "Agent ordinateur",
    kind: "en-cours",
    summary:
      "Moteur d’assistant pour ordinateur en cours de développement : il lit et crée des fichiers et peut proposer des idées. Le projet est écrit en Python, avec une réécriture en Dart en cours.",
    features: [
      "Lecture de fichiers.",
      "Création de fichiers.",
      "Suggestions d’idées.",
      "Moteur Python avec réécriture en Dart en cours.",
    ],
    stack: ["Python", "Dart"],
    cover: "/projects/agent-desktop/agent-desktop.png",
  },
  {
    slug: "demo-hotel",
    title: "Démo : site d'hôtel",
    kind: "demo",
    summary:
      "Démonstration fictive d’un site d’hôtel, conçue comme exemple de présentation de chambres, d’une galerie et d’un parcours de réservation par WhatsApp.",
    features: [
      "Présentation de chambres.",
      "Galerie de photos.",
      "Parcours de réservation par WhatsApp.",
      "Exemple fictif, sans établissement hôtelier réel associé.",
    ],
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-hotel/demo-hotel.png",
  },
  {
    slug: "demo-restaurant",
    title: "Démo : site de restaurant",
    kind: "demo",
    summary:
      "Démonstration fictive d’un site de restaurant, avec exemple de menu, galerie, carte et réservation par WhatsApp.",
    features: [
      "Présentation d’un menu.",
      "Galerie de photos et carte de localisation.",
      "Parcours de réservation par WhatsApp.",
      "Exemple fictif, sans restaurant réel associé.",
    ],
    stack: ["Next.js", "Tailwind"],
    cover: "/projects/demo-restaurant/demo-restaurant.png",
  },
];
