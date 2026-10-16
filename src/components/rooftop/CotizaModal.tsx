"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { whatsappLink } from "@/lib/config";
import { ROOFTOP_WHATSAPP, OPCIONES_COTIZACION } from "@/lib/rooftop-data";

/**
 * Cotizador como modal (desktop) / drawer (mobile). Se abre con el hash
 * "#cotizar" → todos los botones Cotizar (nav, hero, footer) lo disparan sin
 * estado compartido ni props. El form NO toca el servidor: arma el mensaje y
 * abre WhatsApp precargado hacia el número FIJO del rooftop. Honeypot anti-bot.
 */
export default function CotizaModal() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#cotizar");
    const raf = requestAnimationFrame(sync);
    window.addEventListener("hashchange", sync);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  function close() {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpen(false);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if ((data.get("empresa") as string)?.trim()) return; // honeypot
    const nombre = (data.get("nombre") as string)?.trim();
    const tipo = (data.get("tipo") as string) || "";
    const fecha = (data.get("fecha") as string) || "";
    const personas = (data.get("personas") as string) || "";
    const mensaje = (data.get("mensaje") as string)?.trim() || "";
    const lineas = [
      "Hola! Quiero cotizar un evento en Beatmemo Rooftop.",
      tipo && `Tipo: ${tipo}`,
      fecha && `Fecha tentativa: ${fecha}`,
      personas && `Personas: ${personas}`,
      nombre && `Nombre: ${nombre}`,
      mensaje && `\n${mensaje}`,
    ].filter(Boolean);
    window.open(whatsappLink(lineas.join("\n"), ROOFTOP_WHATSAPP), "_blank", "noopener,noreferrer");
    close();
  }

  const field =
    "w-full bg-transparent border border-[#E6E2D8] px-3.5 py-2.5 text-[0.9rem] text-[#141211] placeholder:text-[#a49e92] focus:border-[#141211] outline-none transition";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Cotizá tu evento"
            className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
            initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
          >
            <button onClick={close} aria-label="Cerrar" className="absolute top-4 right-4 text-[#6d685f] hover:text-[#141211] transition">
              <X size={22} />
            </button>
            <p className="font-extrabold text-[0.72rem] tracking-[0.26em] uppercase text-[#b4ac9c] mb-1">Reservá tu fecha</p>
            <h2 className="font-black text-[1.9rem] uppercase tracking-tight leading-none text-[#141211] mb-5">
              Cotizá tu <span className="font-extralight">evento</span>
            </h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" name="empresa" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] w-px h-px opacity-0" />
              <input name="nombre" required placeholder="Tu nombre" maxLength={80} className={`${field} sm:col-span-2`} />
              <select name="tipo" required defaultValue="" className={field} aria-label="Tipo de evento">
                <option value="" disabled>Tipo de evento</option>
                {OPCIONES_COTIZACION.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
              <input name="fecha" type="date" className={field} aria-label="Fecha tentativa" />
              <input name="personas" type="number" min={1} max={200} placeholder="Cantidad de personas" className={`${field} sm:col-span-2`} />
              <textarea name="mensaje" rows={3} maxLength={1000} placeholder="Contanos un poco más (opcional)" className={`${field} sm:col-span-2 resize-none`} />
              <button type="submit" className="sm:col-span-2 bg-[#141211] text-white px-8 py-3.5 uppercase tracking-[0.14em] font-bold text-[0.76rem] hover:bg-black transition mt-1">
                Enviar por WhatsApp
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}