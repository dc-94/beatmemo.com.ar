"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CloudinaryWidget from "./CloudinaryWidget";
import { createEvento } from "@/actions/eventos";
import { eventSchema } from "@/lib/validations/eventos";
import { toast } from "sonner"; // Usamos tu sistema de notificaciones

interface Ciclo {
  id: string;
  nombre: string;
}

interface DrawerProps {
  ciclos: Ciclo[];
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDrawer({ ciclos, isOpen, onClose }: DrawerProps) {
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      es_gratuito: false,
      precio: null,
    }
  });

  // Observamos si es gratuito para ocultar/deshabilitar el campo de precio
  const esGratuito = watch("es_gratuito");
  const tipoEvento = watch("tipo"); 
  // Si el Drawer está cerrado, no renderizamos nada
  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    // Si es gratuito, forzamos que el precio sea NULL
    if (data.es_gratuito) {
      data.precio = null;
    }
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      // Ignoramos nulos, excepto si la intención es mandar un nulo válido (como en precio)
      // FormData no soporta enviar 'null' literales bien, así que no lo appendeamos, 
      // tu Server Action y la DB lo interpretarán como null si falta.
      if (value !== null && value !== undefined && value !== "") {
        formData.append(key, String(value));
      }
    });

    const response = await createEvento(formData);
    
    if (response.success) {
      toast.success("Evento creado exitosamente");
      reset(); // Limpiamos el formulario
      onClose(); // Cerramos el Drawer
    } else {
      toast.error(response.error || "Error al crear el evento");
    }
  };

  return (
    <>
      {/* OVERLAY: Fondo oscuro con blur que cubre toda la pantalla */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* DRAWER: Panel lateral derecho */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[40%] bg-neutral-950 border-l border-neutral-800 z-50 shadow-2xl flex flex-col">
        
        {/* HEADER DEL DRAWER */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-900">
          <h2 className="text-xl font-bold text-white">Nuevo Evento</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition">
            ✕ Cerrar
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO (Con Scroll) */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* TIPO Y CICLO (Grid de 2 columnas) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Tipo de Evento *</label>
                <select {...register("tipo")} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                  <option value="SHOW">Show / Concierto</option>
                  <option value="EVENTO_CULTURAL">Evento Cultural</option>
                </select>
                {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Ciclo *</label>
                <select {...register("ciclo_id")} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                  <option value="">Selecciona un ciclo</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                {errors.ciclo_id && <p className="text-red-500 text-xs mt-1">{errors.ciclo_id.message as string}</p>}
              </div>
            </div>

            {/* TÍTULO */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Título *</label>
              <input {...register("titulo")} placeholder="Ej: Noche de Jazz" className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo.message as string}</p>}
            </div>
            {/* INTEGRANTES (Condicional: Solo para SHOWS) */}
            {tipoEvento === "SHOW" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm text-neutral-400 mb-1">Integrantes / Artistas</label>
                <textarea 
                  {...register("integrantes")} 
                  rows={2} 
                  placeholder="Nombres de los músicos, banda..." 
                  className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" 
                />
                {errors.integrantes && <p className="text-red-500 text-xs mt-1">{errors.integrantes.message as string}</p>}
              </div>
            )}
            {/* FECHA Y HORA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Fecha *</label>
                <input type="date" {...register("fecha")} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none [color-scheme:dark]" />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Hora *</label>
                <input type="time" {...register("hora")} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none [color-scheme:dark]" />
                {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora.message as string}</p>}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Descripción *</label>
              <textarea {...register("descripcion")} rows={3} placeholder="Detalles del evento..." className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion.message as string}</p>}
            </div>

            {/* PRECIO Y GRATUIDAD */}
            <div className="flex items-center gap-6 p-4 bg-neutral-900 border border-neutral-800 rounded">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register("es_gratuito")} className="w-5 h-5 accent-brand-red cursor-pointer" />
                <span className="text-white text-sm">Es evento gratuito</span>
              </label>

              {!esGratuito && (
                <div className="flex-1">
                  <input type="number" step="0.01" {...register("precio")} placeholder="Precio entrada ($)" className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:border-brand-red outline-none" />
                  {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio.message as string}</p>}
                </div>
              )}
            </div>

            {/* IMAGEN (Cloudinary) */}
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Imagen Promocional *</label>
              {/* Le agregamos { shouldValidate: true } para que Zod sepa que se llenó */}
              <CloudinaryWidget onSuccess={(url: string) => setValue("url_imagen", url, { shouldValidate: true })} />
              {errors.url_imagen && <p className="text-red-500 text-xs mt-1">{errors.url_imagen.message as string}</p>}
            </div>

          </form>    
        </div>

        {/* FOOTER DEL DRAWER (Botón Guardar fijo abajo) */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900">
          <button 
            type="submit" 
            form="event-form" 
            disabled={isSubmitting}
            className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50"
          >
            {isSubmitting ? "Guardando Evento..." : "Confirmar y Guardar"}
          </button>
        </div>
      </div>
    </>
  );
}