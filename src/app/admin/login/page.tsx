// src/app/admin/login/page.tsx
import LoginButton from "@/app/admin/LoginButton";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-black-100 px-4 relative overflow-hidden">
      
      {/* Detalle visual de fondo (marca de agua sutil) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-serif font-bold text-[20vw] tracking-tighter text-brand-white-100">
          BEATMEMO
        </span>
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full bg-black/40 p-10 rounded-lg border border-brand-white-300/10 shadow-2xl backdrop-blur-sm">
        

        <h1 className="font-serif font-bold text-3xl text-brand-white-100 tracking-tight mb-2">
          Panel de Control
        </h1>
        
        <p className="font-sans text-brand-white-300 text-sm mb-8">
          Acceso restringido. Solo personal autorizado de Beatmemo.
        </p>

        {/* Aquí inyectamos el botón que creamos */}
        <LoginButton />
        
      </div>
    </main>
  );
}