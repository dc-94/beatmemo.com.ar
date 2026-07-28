// src/app/admin/(dashboard)/contenido/page.tsx
import { createClient } from "@/lib/supabase/server";
import ContenidoClient from "@/components/admin/ContenidoClient";

export const dynamic = "force-dynamic";

export default async function ContenidoPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("site_content")
    .select("clave, imagen_url, alt_texto, titulo, subtitulo, cuerpo, cta_mostrar, cta_texto, cta_link")
    .in("clave", ["pub", "museo", "agenda"]);

  return <ContenidoClient secciones={data ?? []} />;
}