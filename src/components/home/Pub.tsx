// src/components/home/pub.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import PubUI from "./PubUI";

export default async function Pub() {
  const cookieStore = await cookies();
  
  // Inicializamos el cliente de Supabase (Lectura Pública)
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

  // 1. Buscamos solo los platos disponibles que estén marcados como destacados para la Home
  // 2. Limitamos a 3 para no romper el diseño de grilla
  const { data: featuredItems, error } = await supabase
    .from("pub")
    .select("id, nombre, descripcion, url_imagen, tags")
    .eq("disponible", true)
    // .eq("destacado_home", true) // <-- Descomenta esta línea si usaste el boolean en BD, sino traerá 3 random
    .limit(3);

  if (error) {
    console.error("Error fetching pub items:", error);
    // Podrías devolver un UI de "Menú no disponible" aquí si quisieras un fallback
  }

  // Le pasamos los datos reales al componente animado
  return <PubUI items={featuredItems || []} />;
}