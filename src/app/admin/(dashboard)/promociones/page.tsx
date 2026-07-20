// src/app/admin/(dashboard)/promociones/page.tsx
import { createClient } from "@/lib/supabase/server";
import PromocionesClient from "@/components/admin/PromocionesClient";

export const dynamic = "force-dynamic";

export default async function PromocionesPage() {
  const supabase = await createClient();

  const { data: promos } = await supabase
    .from("promociones")
    .select("id, tipo, titulo, descripcion, entidad, logo_url, imagen_url, alt_texto, dias_semana, fecha_desde, fecha_hasta, activo, prioridad")
    .eq("is_deleted", false)
    .order("prioridad", { ascending: false })
    .order("created_at", { ascending: false });

  return <PromocionesClient promos={promos ?? []} />;
}