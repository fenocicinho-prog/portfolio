import { projects, type Project } from "@/content/projects";
import MediaFrame from "@/components/ui/MediaFrame";
import Reveal from "@/components/ui/Reveal";

const label: Record<Project["kind"], string> = {
  realise: "Réalisé",
  "en-cours": "En cours",
  demo: "Démo fictive",
};

export default function Projects() {
  return (
    <section id="projets" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
      <h2 className="font-display text-3xl font-semibold">Projets</h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {projects.map((p) => (
          <Reveal key={p.slug}>
            <article>
              <MediaFrame cover={p.cover} alt={p.title} />
              <div className="mt-4 flex items-center gap-2">
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <span className="rounded-full border border-line px-2 py-0.5 text-sm text-muted">{label[p.kind]}</span>
              </div>
              <p className="mt-2 text-muted">{p.summary}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm">
                {p.stack.map((s) => (
                  <li key={s} className="rounded-full bg-card px-2.5 py-1 ring-1 ring-line">{s}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
