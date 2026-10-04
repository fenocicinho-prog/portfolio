import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { IconDownload } from "@/components/ui/Icons";

// Le CV vient de public/main.pdf. Si tu le remplaces, régénère aussi l'aperçu.
export default function CV() {
  return (
    <section id="cv" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
      <Reveal>
        <h2 className="font-display text-3xl font-semibold">Mon CV</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/main.pdf"
            download="CV-Cicinho-Feno.pdf"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lvl1)] px-5 py-3 font-semibold text-[var(--lvl1-fg)] transition-transform hover:scale-[1.03]"
          >
            <IconDownload /> Télécharger le CV (PDF)
          </a>
          <a
            href="/main.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border-2 border-accent px-5 py-3 font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent"
          >
            Ouvrir en plein écran
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          <iframe
            src="/main.pdf#toolbar=0&navpanes=0&view=FitH"
            title="CV de Cicinho Feno (PDF)"
            loading="lazy"
            className="hidden h-[80vh] min-h-[700px] w-full md:block"
          />
          <Image
            src="/cv-preview.webp"
            alt="Aperçu du CV de Cicinho Feno"
            width={1241}
            height={1754}
            sizes="(min-width: 1024px) 984px, (min-width: 768px) 92vw, calc(100vw - 2.5rem)"
            loading="lazy"
            className="block h-auto w-full md:hidden"
          />
        </div>
      </Reveal>
    </section>
  );
}
