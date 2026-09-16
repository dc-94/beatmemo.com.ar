// src/app/api/cloudinary-sign/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

const CARPETAS_OK = new Set([
  "beatmemo/shows", "beatmemo/pub", "beatmemo/whisky",
  "beatmemo/promos", "beatmemo/espacio", "beatmemo/hero",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: rol } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  if (rol?.role !== "SUPERADMIN" && rol?.role !== "CM") {
    return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
  }

  const body = await request.json();
  const paramsToSign = body?.paramsToSign ?? {};

  // Validación de carpeta (defensa), pero NO modifiques paramsToSign.
  if (paramsToSign.folder && !CARPETAS_OK.has(paramsToSign.folder)) {
    return NextResponse.json({ error: "Carpeta no permitida" }, { status: 400 });
  }

  // Firmá EXACTAMENTE lo que llegó, sin agregar ni quitar nada.
  // api_sign_request ordena las claves alfabéticamente solo (así arma el string).
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,                          // ← el objeto COMPLETO que mandó el widget
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ signature });
}