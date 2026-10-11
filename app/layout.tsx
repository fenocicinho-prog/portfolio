import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { getSiteUrl } from "@/lib/site-url";

const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans" });

const title = `${site.name} — ${site.role} à Nosy Be`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title,
  description: site.tagline,
  alternates: { canonical: "/" },
  icons: { icon: "/rt-logo.png", apple: "/rt-logo.png" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: site.name,
    title,
    description: site.tagline,
    url: "/",
    images: [{ url: "/logo.png" }],
  },
  twitter: { card: "summary", title, description: site.tagline, images: ["/logo.png"] },
  // Code de vérification Google Search Console (balise HTML) : à mettre dans Vercel > Settings > Environment Variables
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  );
}
