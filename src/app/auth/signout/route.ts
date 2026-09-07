// src/app/auth/signout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/config";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", SITE_URL), { status: 303 });
}