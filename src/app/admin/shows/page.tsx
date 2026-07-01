// src/app/admin/shows/page.tsx
import { createClient } from "@/lib/supabase/server"; // Importante: usa el cliente de servidor
import ShowsClient from "./ShowsClient"; // Creamos un componente cliente hijo

export default async function ShowsPage() {
  const supabase = await createClient();
  const { data: ciclos } = await supabase.from('ciclos').select('id, nombre');

  // Pasamos los datos al componente cliente
  return <ShowsClient initialCiclos={ciclos || []} />;
}