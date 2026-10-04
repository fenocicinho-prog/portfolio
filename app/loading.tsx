function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-block ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg py-1 text-fg" role="status" aria-label="Chargement du portfolio">
      <p className="sr-only">Chargement du portfolio…</p>
      <header aria-hidden="true" className="sticky top-3 z-40 mt-3 px-3">
        <div className="mx-auto max-w-5xl rounded-[1.75rem] bg-line p-[2px]">
          <div className="flex items-center justify-between rounded-[1.65rem] bg-card p-3">
            <Skeleton className="h-8 w-24 rounded-full" />
            <div className="hidden items-center gap-2 lg:flex">
              {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-9 w-20 rounded-full" />)}
            </div>
            <Skeleton className="size-11 rounded-full lg:hidden" />
          </div>
        </div>
      </header>

      <main aria-hidden="true">
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12 md:py-20">
          <div className="space-y-5">
            <Skeleton className="h-12 w-4/5 sm:h-16" />
            <Skeleton className="h-12 w-3/4 sm:h-16" />
            <Skeleton className="mt-6 h-9 w-5/6 sm:h-12" />
            <Skeleton className="mt-8 h-12 w-44 rounded-xl" />
          </div>
          <Skeleton className="aspect-square w-full rounded-3xl" />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <Skeleton className="h-9 w-64" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-2xl border border-line bg-card p-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <Skeleton className="h-9 w-48" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {Array.from({ length: 5 }, (_, i) => (
              <article key={i}>
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <Skeleton className="mt-4 h-7 w-3/4" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <Skeleton className="h-9 w-40" />
          <div className="mt-6 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-52 rounded-xl" />
            <Skeleton className="h-12 w-44 rounded-xl" />
          </div>
          <Skeleton className="mt-8 h-[24rem] w-full rounded-2xl md:h-[70vh]" />
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <Skeleton className="h-10 w-3/4 max-w-lg" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-lg" />
          <div className="mt-8 grid max-w-2xl gap-4 rounded-2xl border border-line bg-card p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 rounded-xl" />
              <Skeleton className="h-11 rounded-xl" />
            </div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-52 rounded-xl" />
          </div>
        </section>
      </main>

      <footer aria-hidden="true" className="mx-auto max-w-5xl px-5 py-8">
        <Skeleton className="h-px w-full" />
        <Skeleton className="mt-5 h-4 w-64" />
      </footer>
    </div>
  );
}
