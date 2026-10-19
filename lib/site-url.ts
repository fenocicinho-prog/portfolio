// Utiliser le domaine public canonique, jamais le domaine de prévisualisation Vercel.
// NEXT_PUBLIC_SITE_URL permet de le remplacer lors d'un changement de domaine.
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  return "https://portfolio-fenoproject.vercel.app";
}
