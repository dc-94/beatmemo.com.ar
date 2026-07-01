// src/components/admin/EventDrawer.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CloudinaryWidget from "./CloudinaryWidget";
import { createEvento } from "@/actions/eventos";
import { eventSchema } from "@/lib/validations/eventos";

interface DrawerProps {
  ciclos: any[];
  isOpen: boolean;
  onClose: () => void;
}
export default function EventDrawer({ ciclos, isOpen, onClose }: DrawerProps) {
  const { register, handleSubmit, setValue } = useForm({
  resolver: zodResolver(eventSchema)
});

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    // append logic...
    await createEvento(formData);
    onClose();
  };

  return (
    <>
    <div>
        <button onClick={onClose} className="text-white mb-6 font-bold">X CERRAR</button>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-neutral-900 h-full">
        <input {...register("titulo")} placeholder="Título del evento" className="w-full p-2 bg-neutral-800" />
        
        <select {...register("ciclo_id")}>
            {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <CloudinaryWidget onSuccess={(url) => setValue("image_url", url)} />
        
        <button type="submit" className="bg-brand-red p-2 w-full text-white">Guardar Evento</button>
        </form>    
    </div>

    </>
  );
}