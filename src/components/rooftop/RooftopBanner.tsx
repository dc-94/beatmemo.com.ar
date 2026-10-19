// src/components/rooftop/RooftopBanner.tsx  (Server Component)
// Barra de aviso del rooftop (patrón del AvisoBanner de Beatmemo), estilada en
// negro. Los datos llegan por props desde la page (config_sitio). "#..." y "/..."
// se tratan como internos (misma pestaña) → "#cotizar" abre el modal.
export default function RooftopBanner({ mensaje, link }: { mensaje: string; link?: string }) {
  const cls =
    "fixed top-0 inset-x-0 z-[55] h-10 flex items-center justify-center bg-[#141211] text-white text-[0.72rem] tracking-[0.14em] uppercase font-semibold px-4 text-center";
  if (link) {
    const external = !(link.startsWith("/") || link.startsWith("#"));
    return (
      <a href={link} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={`${cls} hover:bg-black transition`}>
        {mensaje}
      </a>
    );
  }
  return <div className={cls}>{mensaje}</div>;
}