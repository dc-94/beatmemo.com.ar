// Sin TACC + Meat Free Monday, pegados a cocina.
import type { SiteContent } from "@/lib/site-content";

export default function SellosCocina({ sello1, sello2 }: { sello1: SiteContent | null; sello2: SiteContent | null }) {
  return (
    <section className="py-12 bg-[#F2EDE5] border-y border-[#D1CCC0]/50">
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        {sello1 && (
          <div>
            <h3 className="font-sans text-lg font-bold text-[#A68966] mb-2">{sello1.titulo}</h3>
            {sello1.cuerpo && <p className="text-[#5C5852] text-sm leading-relaxed">{sello1.cuerpo}</p>}
          </div>
        )}
        {sello2 && (
          <div>
            <h3 className="font-sans text-lg font-bold text-[#A68966] mb-2">{sello2.titulo}</h3>
            {sello2.cuerpo && <p className="text-[#5C5852] text-sm leading-relaxed">{sello2.cuerpo}</p>}
          </div>
        )}
      </div>
    </section>
  );
}