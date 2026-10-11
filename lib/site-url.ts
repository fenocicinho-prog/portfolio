// Adresse publique du site, sans réglage manuel :
// - en ligne sur Vercel : VERCEL_PROJECT_PRODUCTION_URL = ton domaine par défaut (xxx.vercel.app)
// - si un jour tu ajoutes un domaine perso : définis NEXT_PUBLIC_SITE_URL (prioritaire)
// - en local : http://localhost:3000
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
