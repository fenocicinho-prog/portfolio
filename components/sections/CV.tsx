import Reveal from "@/components/ui/Reveal";
import { IconDownload } from "@/components/ui/Icons";

// Le CV vient de public/main.pdf. Si tu le remplaces, régénère aussi l'aperçu :
//   pdftoppm -r 150 -png -singlefile public/main.pdf cv && (convertir cv.png en public/cv-preview.webp)
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

        {/* Ordinateur : vrai lecteur PDF. Téléphone / navigateur sans lecteur : aperçu image. */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-lg">
          <object
            data="/main.pdf#toolbar=0&navpanes=0&view=FitH"
            type="application/pdf"
            aria-label="CV de Cicinho Feno (PDF)"
            className="hidden h-[80vh] min-h-[700px] w-full md:block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cv-preview.webp" alt="Aperçu du CV de Cicinho Feno" className="h-auto w-full" loading="lazy" />
          </object>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cv-preview.webp" alt="Aperçu du CV de Cicinho Feno" className="block h-auto w-full md:hidden" loading="lazy" />
        </div>
      </Reveal>
    </section>
  );
}
