import Reveal from "@/components/ui/Reveal";
import LeadForm from "@/components/sections/LeadForm";
import { waLink } from "@/lib/whatsapp";

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-20">
      <Reveal>
        <h2 className="font-display text-4xl italic">Parlons de votre projet</h2>
        <p className="mt-3 max-w-xl text-muted">
          Laissez votre WhatsApp ou votre e-mail et je vous recontacte. Vous préférez écrire tout de suite ?{" "}
          <a
            className="font-semibold text-accent underline"
            href={waLink("Bonjour, j'aimerais discuter d'un projet.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ouvrir WhatsApp
          </a>
          .
        </p>
        <LeadForm />
      </Reveal>
    </section>
  );
}
