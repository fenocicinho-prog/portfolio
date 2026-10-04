import Image from "next/image";
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
        <div className="mx-auto w-full max-w-2xl rounded-3xl bg-linear-to-br from-[var(--logo-from)] to-[var(--logo-to)] p-5 shadow-lg ring-1 ring-line sm:p-8">
          <Image
            src="/logo-2k.webp"
            width={2048}
            height={2031}
            alt="X3 Revenue Web Solutions"
            sizes="(min-width: 1200px) 600px, (min-width: 768px) 50vw, calc(100vw - 5rem)"
            preload
            className="h-auto w-full"
          />
        </div>
      </Reveal>
    </section>
  );
}
