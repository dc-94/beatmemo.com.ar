// src/app/terminos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink, LEGAL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Beatmemo",
  description: "Términos y condiciones de uso del sitio web de Beatmemo, Rosario.",
};

export default function TerminosPage() {
  const wsp = whatsappLink();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <h1 className="font-serif text-3xl lg:text-4xl font-bold text-brand-black-100 mb-2">
        Términos y Condiciones
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        Última actualización: {LEGAL.ultimaActualizacion}
      </p>

      <div className="max-w-none space-y-6 text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">1. Aceptación de los términos</h2>
          <p>
            Al acceder y utilizar el sitio web de {LEGAL.nombreFantasia}, operado por{" "}
            {LEGAL.razonSocial} (CUIT {LEGAL.cuit}), con domicilio en {LEGAL.ciudad}, aceptás
            los presentes términos y condiciones. Si no estás de acuerdo con ellos, te pedimos
            que no utilices el sitio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">2. Uso del sitio</h2>
          <p>
            Este sitio tiene fines informativos: presentar nuestra propuesta gastronómica,
            cartelera de espectáculos, museo, promociones vigentes e información de contacto.
            El contenido puede actualizarse, modificarse o discontinuarse en cualquier momento
            sin previo aviso.
          </p>
          <p>
            Te comprometés a utilizar el sitio de manera lícita y a no realizar acciones que
            puedan dañar, sobrecargar o afectar su funcionamiento o el de terceros.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">3. Información de precios, promociones y disponibilidad</h2>
          <p>
            Los precios, promociones, eventos, cartas y disponibilidad de productos publicados
            en el sitio son de carácter <strong>referencial</strong> y pueden variar sin previo
            aviso. La información vigente y definitiva es siempre la disponible en el local.
          </p>
          <p>
            Las promociones bancarias, de billeteras virtuales o de terceros están sujetas a
            los términos, condiciones, topes y vigencias que establezca cada entidad emisora.
            {" "}{LEGAL.nombreFantasia} no es responsable por cambios o cancelaciones dispuestos
            por dichas entidades.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">4. Reservas</h2>
          <p>
            En caso de que el sitio ofrezca la posibilidad de gestionar reservas a través de
            servicios de terceros, dichas reservas están sujetas a disponibilidad y a las
            condiciones informadas al momento de solicitarlas. Nos reservamos el derecho de
            confirmar, reprogramar o cancelar reservas según la operatoria del local.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">5. Propiedad intelectual</h2>
          <p>
            Los contenidos del sitio (textos, imágenes, logo, diseño, elementos gráficos) son
            propiedad de {LEGAL.razonSocial} o se utilizan con la debida autorización. No está
            permitida su reproducción, distribución o modificación sin consentimiento previo
            por escrito.
          </p>
          <p>
            Las marcas, logotipos y nombres comerciales de terceros que puedan aparecer en el
            sitio (entidades bancarias, billeteras virtuales, etc.) pertenecen a sus
            respectivos titulares y se muestran únicamente con fines informativos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">6. Enlaces y servicios de terceros</h2>
          <p>
            El sitio puede incluir enlaces o integraciones con servicios de terceros (por
            ejemplo, agenda de reservas, redes sociales o mapas). No somos responsables por el
            contenido, las políticas de privacidad ni las prácticas de esos sitios o servicios
            externos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">7. Limitación de responsabilidad</h2>
          <p>
            Realizamos nuestro mejor esfuerzo para mantener la información actualizada y el
            sitio disponible, pero no garantizamos que esté libre de errores, interrupciones o
            inexactitudes. El uso del sitio se realiza bajo tu exclusiva responsabilidad.
            {" "}{LEGAL.nombreFantasia} no será responsable por daños derivados del uso o la
            imposibilidad de uso del sitio.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">8. Privacidad</h2>
          <p>
            El tratamiento de datos se rige por nuestra{" "}
            <Link href="/privacidad" className="text-brand-red underline">
              Política de Privacidad
            </Link>
            , que forma parte de estos términos.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">9. Contacto</h2>
          <p>
            Ante cualquier consulta sobre estos términos, escribinos por{" "}
            <a href={wsp} target="_blank" rel="noopener noreferrer" className="text-brand-red underline">
              WhatsApp
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-brand-black-100 mt-8 mb-3">10. Ley aplicable y jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Ante cualquier
            controversia, las partes se someten a la jurisdicción de los tribunales ordinarios
            de {LEGAL.ciudad}, renunciando a cualquier otro fuero que pudiera corresponder.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link href="/" className="text-brand-red text-sm font-semibold hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}