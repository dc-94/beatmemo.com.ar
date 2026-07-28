// src/components/shared/CTALink.tsx
import Link from "next/link";

// Resuelve el CTA editable: interno (/algo) usa <Link> (navegación SPA),
// externo (https://) usa <a> con seguridad. El estilo es el mismo.
export default function CTALink({ href, texto }: { href: string; texto: string }) {
  const esExterno = href.startsWith("https://");
  const cls =
    "bg-[#C5A059] text-black px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#E6C987] transition-colors inline-block";

  if (esExterno) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {texto}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {texto}
    </Link>
  );
}