// src/app/admin/(dashboard)/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import AdminNav from "@/components/admin/AdminNav"; // Importamos el nuevo Navbar

export default async function AdminDashboard() {
  // Validación de Sesión SSR
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  
  await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-brand-black-100 text-brand-white-100 w-full pb-20">
      
      {/* 1. NAVEGACIÓN ADMINISTRATIVA INYECTADA */}
      <AdminNav />

      {/* CONTENEDOR PRINCIPAL */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 mt-2">

        {/* 2. GESTOR DE ETIQUETAS (CHIPS) */}
        <div className="bg-brand-white-300/5 border border-brand-white-300/10 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans font-bold text-brand-white-100 uppercase tracking-widest text-xs mb-1">
              Etiquetas Dinámicas (Chips)
            </h2>
            <p className="text-brand-white-300 text-[11px]">
              Veggie, Sin TACC, Happy Hour, etc.
            </p>
          </div>
          <button className="w-full sm:w-auto bg-brand-white-100 text-brand-black-100 px-4 py-2 rounded-sm font-sans font-bold tracking-wider uppercase text-[10px] hover:bg-brand-white-300 transition-colors">
            Administrar Etiquetas
          </button>
        </div>

        {/* 3. EL FORMULARIO MAGICO (MOBILE FIRST) */}
        <div className="bg-black/40 border border-brand-white-300/10 rounded-lg p-5 sm:p-8 shadow-2xl">
          
          <div className="mb-6">
            <h2 className="font-serif text-2xl text-brand-white-100 font-bold mb-1">Nuevo Ítem del Menú</h2>
            <p className="text-brand-white-300 text-xs">Los campos con * son obligatorios.</p>
          </div>

          <form className="flex flex-col gap-6">
            
            {/* Foto (Dropzone Reducida para Mobile - h-28) */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">
                Fotografía *
              </label>
              <div className="w-full h-28 border-2 border-dashed border-brand-white-300/30 rounded-lg flex flex-col items-center justify-center bg-brand-white-300/5 cursor-pointer hover:border-brand-red-100 transition-colors">
                <svg className="w-6 h-6 text-brand-white-300/50 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-brand-white-300 text-[10px] font-bold">Tocar para subir foto</span>
              </div>
            </div>

            {/* Inputs Básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">Nombre del Plato/Trago *</label>
                <input type="text" placeholder="Ej: The Cavern Burger" className="bg-transparent border border-brand-white-300/30 rounded-sm p-3 text-brand-white-100 focus:border-brand-red-100 focus:outline-none text-sm" required />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">Categoría *</label>
                <select className="bg-brand-black-100 border border-brand-white-300/30 rounded-sm p-3 text-brand-white-100 focus:border-brand-red-100 focus:outline-none text-sm appearance-none" required defaultValue="">
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Food">Comida (Food)</option>
                  <option value="Cocktail">Coctelería (Drinks)</option>
                  <option value="Promo">Promoción</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">Descripción *</label>
              <textarea rows={2} placeholder="Ingredientes o breve descripción..." className="bg-transparent border border-brand-white-300/30 rounded-sm p-3 text-brand-white-100 focus:border-brand-red-100 focus:outline-none text-sm resize-none" required />
            </div>

            {/* Chips y Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">Precio (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-brand-white-300 text-sm">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent border border-brand-white-300/30 rounded-sm p-3 pl-8 w-full text-brand-white-100 focus:border-brand-red-100 focus:outline-none text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans font-bold uppercase tracking-widest text-[10px] text-brand-white-300">Etiquetas (Chips) - Opcional</label>
                <select multiple className="bg-brand-black-100 border border-brand-white-300/30 rounded-sm p-3 text-brand-white-100 focus:border-brand-red-100 focus:outline-none text-sm h-[46px] opacity-70 cursor-not-allowed" disabled>
                  <option>Veggie</option>
                  <option>Sin TACC</option>
                </select>
                <span className="text-brand-white-300/50 text-[9px] mt-1">Sostén CTRL/CMD para elegir varios</span>
              </div>
            </div>

            <hr className="border-brand-white-300/10 my-2" />

            {/* Toggles de Visibilidad */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 border border-brand-white-300/20 rounded-sm cursor-pointer hover:bg-brand-white-300/5 transition-colors">
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-sm text-brand-white-100">Disponible en el Menú</span>
                  <span className="text-[10px] text-brand-white-300">Apagalo si no hay stock.</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-brand-red-100" defaultChecked />
              </label>

              <label className="flex items-center justify-between p-3 border border-brand-white-300/20 rounded-sm cursor-pointer hover:bg-brand-white-300/5 transition-colors">
                <div className="flex flex-col">
                  <span className="font-sans font-bold text-sm text-brand-white-100">Destacado en el Inicio</span>
                  <span className="text-[10px] text-brand-white-300">Aparecerá en las fotos grandes de la Home.</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-brand-red-100" />
              </label>
            </div>

            {/* Botón de Guardado */}
            <button type="button" className="w-full bg-brand-red-100 text-brand-white-100 py-4 rounded-sm font-sans font-bold tracking-widest uppercase text-sm hover:bg-brand-red-200 transition-colors shadow-lg mt-2">
              Guardar Ítem
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}