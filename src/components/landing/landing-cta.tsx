import Image from "next/image";
import Link from "next/link";

export function LandingCTA() {
  return (
    <section className="bg-[#E9EBF6] px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1160px]">
        <div className="relative overflow-hidden rounded-[32px] bg-[#1C1C1C] px-6 py-16 text-center sm:px-16 sm:py-20">
          <Image
            src="/landing/images/cta-bg.jpg"
            alt=""
            fill
            sizes="(min-width: 1160px) 1160px, 100vw"
            className="pointer-events-none object-cover"
          />

          <div className="relative flex flex-col items-center gap-6">
            <div className="relative w-[170px] sm:w-[226px]">
              <Image
                src="/landing/images/cta-bike-cutout.png"
                alt=""
                width={1337}
                height={840}
                className="h-auto w-full"
              />
              <img
                src="/landing/icons/cta-bike.svg"
                alt=""
                className="absolute -right-2 -top-2 h-9 w-8 sm:-right-3 sm:-top-3 sm:h-11 sm:w-10"
              />
            </div>

            <h2 className="max-w-[620px] font-[family-name:var(--font-landing-heading)] text-3xl font-bold leading-tight tracking-tight text-[#F5F3EE] sm:text-[38.4px]">
              Pronto para deixar de adivinhar quando foi a última manutenção?
            </h2>

            <p className="max-w-[440px] text-sm leading-relaxed text-white/85">
              Cria a tua conta e regista a tua primeira bicicleta em menos de dois minutos.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#43F3AF] px-6 py-3.5 text-sm font-bold text-[#06291F] transition-opacity hover:opacity-90"
            >
              Começar grátis
              <img src="/landing/icons/arrow.svg" alt="" className="h-3.5 w-3.5" />
            </Link>

            <p className="text-sm text-white">Grátis para sempre · 1 bicicleta incluída</p>
          </div>
        </div>
      </div>
    </section>
  );
}
