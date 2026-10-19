import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaFrame from "@/components/ui/MediaFrame";
import { projects, type Project } from "@/content/projects";
import { getSiteUrl } from "@/lib/site-url";

const statusLabel: Record<Project["kind"], string> = {
  realise: "Projet réalisé",
  "en-cours": "Projet en cours",
  demo: "Démonstration fictive",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: "Projet introuvable", robots: { index: false, follow: false } };

  const title = `${project.title} — Projet de portfolio | Feno`;
  const description = project.summary;
  const canonical = `/projets/${project.slug}`;
  const image = project.cover ?? "/logo.png";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "fr_FR",
      siteName: "Feno",
      title,
      description,
      url: canonical,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const pageUrl = `${getSiteUrl()}/projets/${project.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: pageUrl,
    creator: { "@type": "Person", name: "Feno" },
    keywords: project.stack.join(", "),
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Fil d’Ariane" className="mb-10 text-sm text-muted">
        <Link className="underline underline-offset-4 hover:text-fg" href="/">
          Portfolio de Feno
        </Link>
        <span aria-hidden="true"> / </span>
        <Link className="underline underline-offset-4 hover:text-fg" href="/#projets">
          Projets
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{project.title}</span>
      </nav>

      <article>
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
            {statusLabel[project.kind]}
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{project.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{project.summary}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <MediaFrame cover={project.cover} alt={`Aperçu du projet ${project.title}`} />
            {project.kind === "demo" && (
              <p className="mt-3 text-sm text-muted">
                Cette réalisation est une démonstration fictive destinée à présenter un exemple de site ; elle ne représente pas un établissement réel.
              </p>
            )}
            {project.kind === "en-cours" && (
              <p className="mt-3 text-sm text-muted">
                Ce projet est encore en développement ; sa description présente son état actuel.
              </p>
            )}
          </div>

          <div className="space-y-8">
            <section aria-labelledby="project-features">
              <h2 id="project-features" className="font-display text-2xl font-semibold">Fonctionnalités principales</h2>
              <ul className="mt-3 space-y-2 leading-relaxed text-muted">
                {project.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
            </section>

            <section aria-labelledby="project-stack">
              <h2 id="project-stack" className="font-display text-2xl font-semibold">Technologies</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((technology) => (
                  <li key={technology} className="rounded-full bg-card px-3 py-1.5 text-sm ring-1 ring-line">
                    {technology}
                  </li>
                ))}
              </ul>
            </section>

            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 font-semibold text-on-accent hover:opacity-90"
              >
                Voir le projet en ligne
              </a>
            ) : (
              <p className="text-sm text-muted">Aucun lien public de démonstration n’est disponible pour le moment.</p>
            )}
          </div>
        </div>
      </article>

      <p className="mt-14 border-t border-line pt-6">
        <Link className="font-semibold text-accent underline underline-offset-4" href="/#projets">
          ← Retour à tous les projets
        </Link>
      </p>
    </main>
  );
}
