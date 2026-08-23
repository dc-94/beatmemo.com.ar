// src/components/layout/SkipToContent.tsx

export default function SkipToContent() {
  return (
    
    <a  href="#contenido-principal"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#C5A059] focus:text-black focus:px-4 focus:py-2 focus:font-bold focus:uppercase focus:tracking-widest focus:text-xs focus:rounded"
    >
      Saltar al contenido
    </a>
  );
}