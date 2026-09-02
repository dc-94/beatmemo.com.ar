// src/app/admin/(dashboard)/pub/page.tsx
import Link from "next/link";
import { Images, Star, UtensilsCrossed, Wine } from "lucide-react";

const SECCIONES = [
  { name: "Gastronomía", href: "/admin/pub/gastronomia", icon: UtensilsCrossed, desc: "Platos, tragos y categorías" },
  { name: "Whiskies", href: "/admin/pub/whiskies", icon: Wine, desc: "Colección de etiquetas" },
  { name: "Destacado home", href: "/admin/pub/destacados", icon: Star, desc: "Qué se ve en la portada" },
  { name: "Nuestro espacio", href: "/admin/pub/espacio", icon: Images, desc: "Galería de fotos" },
];

export default function PubHubPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-white">Pub</h1>
        <p className="text-sm text-neutral-400">Gestioná la gastronomía, la barra y el espacio.</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECCIONES.map(({ name, href, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <span className="p-2.5 rounded-lg bg-white/5 text-amber-400"><Icon size={22} /></span>
            <div>
              <p className="font-semibold text-white">{name}</p>
              <p className="text-xs text-neutral-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}