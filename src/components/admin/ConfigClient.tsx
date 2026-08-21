// src/components/admin/ConfigClient.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { updateConfigSitio } from "@/actions/config-sitio";

type Horario = { dias: string; horario: string };

export default function ConfigClient({ config }: { config: any }) {
  const [horarios, setHorarios] = useState<Horario[]>(config?.horarios ?? []);
  const [bannerActivo, setBannerActivo] = useState<boolean>(config?.banner_activo ?? false);
  const [guardando, setGuardando] = useState(false);

  const addHorario = () => setHorarios([...horarios, { dias: "", horario: "" }]);
  const rmHorario = (i: number) => setHorarios(horarios.filter((_, idx) => idx !== i));
  const setHorario = (i: number, campo: keyof Horario, val: string) =>
    setHorarios(horarios.map((h, idx) => (idx === i ? { ...h, [campo]: val } : h)));

  const handleSubmit = async (formData: FormData) => {
    setGuardando(true);
    try {
      // Los horarios (estado local) se serializan a JSON en un campo oculto.
      formData.set("horarios", JSON.stringify(horarios.filter(h => h.dias && h.horario)));
      formData.set("banner_activo", bannerActivo ? "true" : "false");

      const res = await updateConfigSitio(formData);
      if (res.success) toast.success("Configuración guardada");
      else {
        toast.error(res.error || "No se pudo guardar");
        if (res.fieldErrors) Object.values(res.fieldErrors).flat().forEach(m => m && toast.error(m));
      }
    } catch (e) {
      console.error("[ConfigClient]", e);
      toast.error("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const inputCls = "w-full bg-neutral-900 border border-neutral-800 text-white p-2.5 rounded text-sm focus:border-brand-red outline-none";
  const labelCls = "block text-sm text-neutral-400 mb-1";

  return (
    <form action={handleSubmit} className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif text-white">Configuración del sitio</h1>
        <p className="text-neutral-400 text-sm">Contacto, horarios, redes y avisos.</p>
      </div>

      {/* CONTACTO */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono (con código país)</label>
            <input name="telefono_intl" defaultValue={config?.telefono_intl ?? ""} placeholder="+5493412023737" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp <span className="text-neutral-600">(solo números)</span></label>
            <input name="whatsapp_numero" defaultValue={config?.whatsapp_numero ?? ""} placeholder="5493412023737" className={inputCls} />
          </div>
        </div>
      </section>

      {/* HORARIOS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Horarios</h2>
          <button type="button" onClick={addHorario} className="flex items-center gap-1 text-brand-gold text-xs font-semibold hover:text-brand-gold/80">
            <Plus size={14} /> Agregar franja
          </button>
        </div>
        {horarios.length === 0 && <p className="text-neutral-600 text-sm">Sin horarios cargados. Agregá una franja.</p>}
        <div className="space-y-2">
          {horarios.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={h.dias} onChange={e => setHorario(i, "dias", e.target.value)} placeholder="Lunes a jueves" className={`${inputCls} flex-1`} />
              <input value={h.horario} onChange={e => setHorario(i, "horario", e.target.value)} placeholder="8:30 a 00:30" className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => rmHorario(i)} className="text-red-500 hover:text-red-400 p-2 shrink-0"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* REDES */}
      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Redes y reseñas</h2>
        <div>
          <label className={labelCls}>Instagram</label>
          <input name="instagram_url" defaultValue={config?.instagram_url ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Facebook</label>
          <input name="facebook_url" defaultValue={config?.facebook_url ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Link de reseña de Google</label>
          <input name="google_review_url" defaultValue={config?.google_review_url ?? ""} className={inputCls} />
        </div>
      </section>

      {/* BANNER */}
      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-brand-gold font-bold">Aviso temporal</h2>
        <div className="border border-neutral-800 rounded p-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={bannerActivo} onChange={e => setBannerActivo(e.target.checked)} className="w-4 h-4 accent-brand-red" />
            <span className="text-sm text-white font-medium">Mostrar barra de aviso arriba del sitio</span>
          </label>
          {bannerActivo && (
            <div className="space-y-3 pt-1">
              <div>
                <label className={labelCls}>Mensaje</label>
                <input name="banner_mensaje" defaultValue={config?.banner_mensaje ?? ""} placeholder="Cerrado el 25/12 · ¡Felices fiestas!" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Se apaga solo el <span className="text-neutral-600">(opcional)</span></label>
                <input type="datetime-local" name="banner_vence" defaultValue={config?.banner_vence ? new Date(config.banner_vence).toISOString().slice(0,16) : ""} className={` ${inputCls} `} />
              </div>
            </div>
          )}
        </div>
      </section>

      <button type="submit" disabled={guardando} className="bg-brand-red hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded transition text-sm disabled:opacity-50">
        {guardando ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}