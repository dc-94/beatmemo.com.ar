// src/app/admin/reauth/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));

  const res = NextResponse.redirect(new URL("/admin/usuarios", request.url));
  res.cookies.set("sudo_until", String(Date.now() + 5 * 60 * 1000), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", 
    path: "/",
    maxAge: 300,
  });
  return res;
}