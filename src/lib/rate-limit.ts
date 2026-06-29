// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configuración del Limitador: 50 peticiones por minuto por usuario/IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: false,
});

export async function rateLimit(identifier: string) {
  try {
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      throw new Error("Too many requests");
    }
  } catch (error) {
    // Si Redis falla o no hay variables de entorno, dejamos pasar para no romper la app entera
    console.warn("Ratelimit bypass:", error);
  }
}