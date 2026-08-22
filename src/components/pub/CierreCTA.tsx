import CTALink from "@/components/shared/CTALink";

export default function CierreCTA() {
  return (
    <section className="py-20 lg:py-28 text-center bg-[#FAF7F2]">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-serif text-3xl lg:text-4xl font-bold text-[#2C2924] mb-6">
          ¿Vemos la carta entera?
        </h2>
        <CTALink href="/menu" texto="Abrir la carta" />
      </div>
    </section>
  );
}