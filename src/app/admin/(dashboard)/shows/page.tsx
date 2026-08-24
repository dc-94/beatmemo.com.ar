// src/app/admin/shows/page.tsx
import { createClient } from "@/lib/supabase/server"; // Importante: usa el cliente de servidor
import ShowsClient from "./ShowsClient"; // Creamos un componente cliente hijo

export default async function ShowsPage() {
  const supabase = await createClient();

 // 1. Traemos los shows ordenados por fecha (los más nuevos o próximos primero)
  const { data: shows, error: showsError } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: false });

  if (showsError) console.error("Error al cargar shows:", showsError);

  // 2. Traemos los ciclos para los filtros y nombres
  const { data: ciclos, error: ciclosError } = await supabase
    .from('ciclos')
    .select('id, nombre,tipo').order('nombre');

  if (ciclosError) console.error("Error al cargar ciclos:", ciclosError);
  // Pasamos los datos al componente cliente
return <ShowsClient shows={shows || []} ciclos={ciclos || []} />;
}