"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StickyFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("categoria");

  const handleFilter = (cat: string) => {
    // Si ya está activa, limpiamos el filtro. Si no, lo seteamos.
    const newCategory = activeCategory === cat ? "" : cat;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newCategory) {
      params.set("categoria", newCategory);
    } else {
      params.delete("categoria");
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-40 bg-[#000000] py-4 border-b border-brand-red-100/20">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-7xl mx-auto px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`px-6 py-2 rounded-none border text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? "bg-brand-red-100 border-brand-red-100 text-white" 
                : "border-brand-red-100/30 text-brand-white-300 hover:border-brand-red-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}