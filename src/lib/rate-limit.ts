// src/lib/rate-limit.ts
import { headers } from "next/headers";

// Store simple en memoria (esto es lo que reemplazaremos por Redis más adelante)
const store = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit() {
  const ip = (await headers()).get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const windowMs = 60 * 1000; // Ventana de 1 minuto
  
  const record = store.get(ip) || { count: 0, resetAt: now + windowMs };
  
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  
  record.count++;
  store.set(ip, record);
  
  // Limitar a 50 peticiones por minuto por IP
  if (record.count > 50) {
    throw new Error("Too many requests");
  }
}