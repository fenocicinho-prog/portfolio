import Reveal from "@/components/ui/Reveal";

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:py-20">
      <Reveal>
        <h1 className="font-display text-5xl italic leading-[1.05] sm:text-7xl">
          Une idée,<br />une plateforme.
        </h1>
        <p className="mt-6 text-4xl font-medium leading-tight tracking-tight text-muted sm:text-5xl">
          Plus de clients avec Feno
        </p>
      </Reveal>
      <Reveal>
        {/* Logo recadré au plus près, fourni en 2K / 4K (le navigateur choisit selon l'écran).
            La carte derrière change de teinte avec le thème (variables --logo-from / --logo-to). */}
        <div className="mx-auto w-full max-w-2xl rounded-3xl bg-linear-to-br from-[var(--logo-from)] to-[var(--logo-to)] p-5 shadow-lg ring-1 ring-line sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-2k.webp"
            srcSet="/logo-2k.webp 2048w, /logo-4k.webp 4096w"
            sizes="(min-width: 768px) 42rem, 92vw"
            width={4096}
            height={4062}
            alt="X3 Revenue Web Solutions"
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full"
          />
        </div>
      </Reveal>
    </section>
  );
}
