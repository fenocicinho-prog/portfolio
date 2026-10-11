import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Projects from "@/components/sections/Projects";
import CV from "@/components/sections/CV";
import Contact from "@/components/sections/Contact";
import { site } from "@/content/site";
import { getSiteUrl } from "@/lib/site-url";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${site.name} — ${site.role}`,
  description: site.tagline,
  url: getSiteUrl(),
  email: site.email,
  areaServed: site.city,
  address: { "@type": "PostalAddress", addressLocality: "Nosy Be", addressCountry: "MG" },
  sameAs: [site.github, site.facebook],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main>
        <Hero />
        <Services />
        <Projects />
        <CV />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
