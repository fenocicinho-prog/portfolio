import type { ReactNode } from "react";

/**
 * Garde la structure de mise en page sans cacher le contenu rendu côté serveur.
 * Les sections restent lisibles immédiatement et ne nécessitent plus d’observer
 * IntersectionObserver pour apparaître après l’hydratation.
 */
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className || undefined}>{children}</div>;
}
