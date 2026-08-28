import type { NextConfig } from "next";
// Dominios externos que el sitio realmente usa. Si agregás un servicio nuevo,
// esta lista es el primer lugar donde mirar cuando algo "no carga".
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isDev = process.env.NODE_ENV === "development";

const csp = [
  // Base: todo lo no especificado abajo, solo del propio origen.
  `default-src 'self'`,

  // SCRIPTS. 'unsafe-inline' es necesario: Next inyecta scripts inline y sin
  // nonce no hay forma de autorizarlos (el nonce mataría el ISR).
  // 'unsafe-eval' SOLO en dev: lo pide React Refresh / HMR.
   `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://upload-widget.cloudinary.com https://widget.cloudinary.com https://www.googletagmanager.com https://assets.calendly.com`,

   `connect-src 'self' ${SUPABASE_URL} wss://${SUPABASE_URL.replace("https://", "")} https://api.cloudinary.com https://res.cloudinary.com https://www.google-analytics.com https://region1.google-analytics.com https://calendly.com https://browser-intake-datadoghq.com`,

  `frame-src 'self' https://upload-widget.cloudinary.com https://widget.cloudinary.com https://accounts.google.com https://calendly.com https://assets.calendly.com`,
  
    // ESTILOS. Tailwind y styled-jsx inyectan <style> inline.
  `style-src 'self' 'unsafe-inline'`,

  // IMÁGENES. data: y blob: los usa next/image y el render de PDF a canvas.
  `img-src 'self' data: blob: https://res.cloudinary.com ${SUPABASE_URL} https://www.google-analytics.com`,
  // FUENTES. next/font las auto-hospeda, así que 'self' alcanza.
  `font-src 'self' data:`,


  // AUDIO/VIDEO. 'self' + Supabase Storage (para la audioguía cuando migre).
  `media-src 'self' ${SUPABASE_URL}`,

  // WORKERS. PDF.js corre en un web worker desde blob:.
  `worker-src 'self' blob:`,

  // Sin plugins ni <object>. No los usás y son vector de ataque.
  `object-src 'none'`,

  // Impide que un script inyectado cambie la <base> y redirija rutas relativas.
  `base-uri 'self'`,

  // Los formularios solo pueden postear al propio sitio o al login de Google.
  `form-action 'self' https://accounts.google.com`,

  // Equivalente moderno de X-Frame-Options. Los dos conviven sin problema.
  `frame-ancestors 'self'`,
]
  .filter(Boolean)
  .join("; ");


const securityHeaders = [
  // REPORT-ONLY: declara la política pero NO bloquea nada. Las violaciones
  // aparecen en la consola del navegador. Se pasa a enforce recién cuando
  // el reporte esté limpio.
  { key: "Content-Security-Policy", value: csp },

  // Impide que el sitio (sobre todo el vault) se cargue en un <iframe> ajeno.
  // Sin esto, alguien puede embeber el login y capturar clicks (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // El navegador respeta el Content-Type declarado y no "adivina" el tipo.
  // Evita que un archivo subido se interprete como script.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // No filtrar la URL completa a sitios externos. Con query params sensibles
  // (tokens de auth en el callback) esto importa.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Denegar APIs del navegador que el sitio no usa. Si un script inyectado
  // intenta pedir la cámara o el micrófono, el navegador lo bloquea de plano.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },

  // HSTS: fuerza HTTPS por 2 años. OJO — solo tiene efecto sobre HTTPS, así
  // que en local (http://localhost) es inofensivo. Se activa de verdad cuando
  // Vercel emita los certificados el día del deploy.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplica a todas las rutas.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  
  reactStrictMode: true,
    allowedDevOrigins: ["192.168.1.42", "*.nip.io","192.168.100.86","qr.192.168.100.86.nip.io", "192.168.100.86.nip.io"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/djmbcrliu/**",
      },
    ],
  },
};

export default nextConfig;