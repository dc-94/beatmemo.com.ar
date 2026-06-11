import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Activamos el modo estricto de React para asegurar un renderizado libre de bugs de memoria
  reactStrictMode: true,
  
  // Dejamos el objeto experimental limpio. Next.js 16 detecta la raíz 
  // automáticamente al ejecutar los comandos desde la carpeta del proyecto.
  experimental: {},
};

export default nextConfig;