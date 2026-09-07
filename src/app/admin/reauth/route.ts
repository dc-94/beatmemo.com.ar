// src/app/admin/reauth/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Marca "sudo" tras re-consentir. La action sensible chequea que sea reciente.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/admin/usuarios";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));

  const res = NextResponse.redirect(new URL(next, request.url));
  // Cookie httpOnly de 5 min: ventana sudo.
  res.cookies.set("sudo_until", String(Date.now() + 5 * 60 * 1000), {
    httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 300,
  });
  return res;
}