import { services } from "@/content/services";
import Reveal from "@/components/ui/Reveal";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
      <h2 className="font-display text-3xl font-semibold">Ce que je propose</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {services.map((s) => (
          <Reveal key={s.title}>
            <div className="h-full rounded-2xl border border-line bg-card p-6">
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
