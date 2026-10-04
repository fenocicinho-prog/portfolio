import Image from "next/image";

// Affiche la capture si elle existe, sinon un cadre "à venir".
export default function MediaFrame({ cover, alt }: { cover?: string; alt: string }) {
  return (
    <div className="aspect-video overflow-hidden rounded-2xl border border-line bg-card">
      {cover ? (
        <Image
          src={cover}
          alt={alt}
          width={1280}
          height={720}
          sizes="(min-width: 1024px) 496px, (min-width: 640px) 48vw, calc(100vw - 2.5rem)"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-sm text-muted">Capture à venir</div>
      )}
    </div>
  );
}
