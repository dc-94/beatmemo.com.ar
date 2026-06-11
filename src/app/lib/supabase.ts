import { createBrowserClient } from '@supabase/ssr'

// Leemos las credenciales del archivo .env.local de forma segura
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Creamos un único cliente de Supabase para usar en toda la web
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)