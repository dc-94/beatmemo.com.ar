"use client";

import { useDrawerA11y } from "@/hooks/useDrawerA11y";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CloudinaryWidget from "./CloudinaryWidget";
import { upsertEvento, deleteEvento } from "@/actions/eventos";
import { eventSchema } from "@/lib/validations/eventos";
import { toast } from "sonner"; 
import { useEffect,useState } from "react";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";


interface Ciclo {
  id: string;
  nombre: string;
  tipo: string;
}

interface DrawerProps {
  ciclos: Ciclo[];
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: any;
  userRole?: string;
}

export default function EventDrawer({ ciclos, isOpen, onClose, eventToEdit, userRole }: DrawerProps) {
  const isEditing = !!eventToEdit;
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Sin rol conocido asumimos el peor caso (permanente). Over-warnear es seguro;
  // decir "recuperable" cuando en realidad borra es la falla peligrosa.
  const borradoPermanente = userRole !== "CM";
  const { register, handleSubmit, setValue, watch, reset,setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { es_gratuito: false, precio: null, tipo: "SHOW", ciclo_id: "" },
  });

  const drawerRef = useDrawerA11y(isOpen, onClose);

  const esGratuito = watch("es_gratuito");
  const tipoEvento = watch("tipo");
  const ciclosFiltrados = ciclos.filter((c) => c.tipo === tipoEvento);
 

  useEffect(() => {
    if (eventToEdit) {
      const tipoDelEvento = eventToEdit.tipo || "SHOW";
      reset({
        ...eventToEdit,
        tipo: tipoDelEvento,
        ciclo_id: eventToEdit.ciclo_id || "",
      });
    } else {
      reset({
        es_gratuito: false, precio: null, tipo: "SHOW", ciclo_id: "",
        titulo: "", fecha: "", hora: "", descripcion: "", integrantes: "", url_imagen: "",
      });
    }
  }, [eventToEdit, reset]);

 
  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      if (data.url_imagen && !data.url_imagen.includes('?t=')) {
        data.url_imagen = `${data.url_imagen}?t=${new Date().getTime()}`;
      }

      if (data.es_gratuito) data.precio = null;

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;
        formData.append(key, value === null ? "" : String(value));
      });

      const response = await upsertEvento(formData, isEditing ? eventToEdit.id : undefined);
      if (response.success) {
        toast.success(isEditing ? "Evento actualizado" : "Evento creado");
        onClose();
      } else {
        if (response.fieldErrors) {
          Object.entries(response.fieldErrors).forEach(([campo, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (msg) setError(campo as any, { type: "server", message: msg });
          });
        }
        toast.error(response.error || "Revisá los campos marcados");
      }
    } catch (e) {
      console.error("[EventDrawer] upsert falló:", e);
      toast.error("No se pudo guardar. Revisá tu conexión y probá de nuevo.");
    }
  };
  // LÓGICA DE BORRADO
   const handleDelete = () => {
    if (!eventToEdit?.id) return;
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToEdit?.id) return;
    setIsDeleting(true);
    try {
      const response = await deleteEvento(eventToEdit.id);
      if (response.success) {
        toast.success(borradoPermanente ? "Evento eliminado" : "Evento archivado");
        setConfirmOpen(false);
        onClose();
      } else {
        toast.error(response.error || "No se pudo eliminar el evento");
      }
    } catch (e) {
      console.error("[EventDrawer] delete falló:", e);
      toast.error("No se pudo eliminar. Revisá tu conexión y probá de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-full md:w-[60%] lg:w-[40%] bg-neutral-950 border-l border-neutral-800 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-6 border-b border-neutral-800 bg-neutral-900 flex justify-between">
          <h2 className="text-xl font-bold text-white">{isEditing ? "Editar Evento" : "Nuevo Evento"}</h2>
          <button onClick={onClose} className="text-white">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* TIPO Y CICLO (Grid de 2 columnas) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Tipo de Evento *</label>
                <select {...register("tipo")} onChange={(e) => { register("tipo").onChange(e); setValue("ciclo_id", "");}} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                  <option value="SHOW">Show / Concierto</option>
                  <option value="EVENTO_CULTURAL">Evento Cultural</option>
                </select>
                {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">Ciclo *</label>
                <select {...register("ciclo_id")} className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-brand-red outline-none">
                  <option value="">Selecciona un ciclo</option>
                  {ciclosFiltrados.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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
                  placeholder="Separá los nombres con coma para que se muestren como listado" 
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
              <CloudinaryWidget folder="beatmemo/shows" onSuccess={(url: string) => setValue("url_imagen", url, { shouldValidate: true })} />
              {errors.url_imagen && <p className="text-red-500 text-xs mt-1">{errors.url_imagen.message as string}</p>}
            </div>

          </form>    
        </div>

        {/* FOOTER: Botones apilados en móvil, uno al lado del otro en escritorio */}
        <div className="p-4 md:p-6 border-t border-neutral-800 bg-neutral-900 flex flex-col md:flex-row gap-3 mb-24">
          {/* El botón eliminar SOLO aparece si estamos editando */}
          {isEditing && (
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting || isSubmitting} className="w-full md:w-auto">
              {isDeleting ? "Borrando…" : "Eliminar"}
            </Button>
          )}
          
          <Button type="submit" form="event-form" disabled={isSubmitting || isDeleting} fullWidth className="flex-1">
            {isSubmitting ? "Guardando…" : (isEditing ? "Actualizar" : "Guardar")}
          </Button>
        </div>
      </div>
     <ConfirmDialog
        open={confirmOpen}
        danger
        loading={isDeleting}
        title="¿Eliminar este evento?"
        message={
          borradoPermanente
            ? "Se elimina de forma permanente. Esta acción no se puede deshacer."
            : "El evento se archivará y dejará de mostrarse en el sitio. Un superadmin puede recuperarlo."
        }
        confirmLabel={borradoPermanente ? "Eliminar definitivamente" : "Archivar evento"}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}