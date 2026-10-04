import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="border-t border-line py-8 text-center text-sm text-muted">
      © {new Date().getFullYear()} {site.name} · {site.city}
    </footer>
  );
}
