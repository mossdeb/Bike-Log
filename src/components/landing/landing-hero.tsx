import Image from "next/image";
import Link from "next/link";

export function LandingHero() {
  return (
    <section className="bg-white px-4 pb-16 pt-4 sm:px-8">
      <div className="relative mx-auto max-w-[1470px] overflow-hidden rounded-[32px] bg-[#43F3AF]">
        <Image
          src="/landing/images/hero-bike.jpg"
          alt="Mountain bike suspensa em estúdio"
          fill
          priority
          sizes="(min-width: 1470px) 1470px, 100vw"
          className="pointer-events-none object-cover object-center"
        />

        <div className="relative grid grid-cols-1 gap-11 px-6 py-16 sm:px-12 md:grid-cols-2 md:py-24 lg:px-24">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <img src="/landing/icons/hero-badge.svg" alt="" className="h-[46px] w-[46px] shrink-0" />
              <span className="text-sm font-medium text-[#101014]/80">Gestão inteligente da manutenção</span>
            </div>

            <h1 className="font-[family-name:var(--font-landing-heading)] text-5xl font-bold leading-[1.1] tracking-tight text-[#F5F3EE] sm:text-[60px]">
              Mantém a tua bicicleta sempre em dia.
            </h1>

            <div className="h-px w-full bg-[#101014]/20" />

            <p className="max-w-[460px] text-base font-medium leading-relaxed text-[#101014]/80 sm:text-[16.8px]">
              Regista cada bicicleta, acompanha o desgaste dos componentes e recebe alertas antes de surgir um
              problema. Menos avarias inesperadas, mais tempo a pedalar.
            </p>

            <div className="flex flex-wrap items-center gap-5 sm:gap-6">
              <div className="flex items-start gap-2.5">
                <img src="/landing/icons/bell.svg" alt="" className="mt-0.5 h-4 w-4 shrink-0 brightness-0" />
                <div>
                  <p className="text-sm font-bold text-[#101014]">Alertas</p>
                  <p className="text-xs text-[#101014]/60">Nunca te esqueças de uma revisão</p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#101014]/20" />
              <div className="flex items-start gap-2.5">
                <img src="/landing/icons/badge-service.svg" alt="" className="mt-0.5 h-4 w-4 shrink-0 brightness-0" />
                <div>
                  <p className="text-sm font-bold text-[#101014]">Reparações</p>
                  <p className="text-xs text-[#101014]/60">Evita reparações dispendiosas</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#43F3AF] px-6 py-3.5 text-sm font-bold text-[#101014] transition-opacity hover:opacity-90"
              >
                Começar grátis
              </Link>
              <a
                href="#precos"
                className="inline-flex items-center rounded-full border border-[#101014]/35 px-6 py-3.5 text-sm font-bold text-[#101014] transition-colors hover:bg-white/30"
              >
                Ver planos
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[420px] md:block">
            <div className="absolute left-[14%] top-0 flex flex-col items-start gap-2 rounded-[15px] bg-white p-4 shadow-xl">
              <img src="/landing/icons/hero-bike-card.svg" alt="" className="h-10 w-10 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#101014]">A minha bicicleta</p>
                <p className="text-xs text-[#8A8D93]">Enduro &nbsp;·&nbsp; 180km</p>
              </div>
            </div>

            <div className="absolute right-[-8%] top-[38%] flex items-center gap-3 rounded-[15px] bg-white p-4 shadow-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F1F1]">
                <img src="/landing/icons/hero-shock.svg" alt="" className="h-5 w-5" />
              </span>
              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-[#101014]">Fox 38</p>
                <p className="text-xs text-[#8A8D93]">Revisão em 30 horas</p>
              </div>
              <span className="ml-2 rounded-full bg-[#E0442F]/[0.13] px-2.5 py-1 text-xs font-bold text-[#E0442F]">
                Atrasado
              </span>
            </div>

            <div className="absolute bottom-[4%] left-[10%] w-[30%] rounded-[15px] bg-[#FFAD2D] p-4 shadow-xl">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-[#FFAD2D]">
                !
              </span>
              <p className="mt-2 text-xs font-bold text-[#101014]/70">Desgaste atual</p>
              <p className="font-[family-name:var(--font-landing-heading)] text-xl font-extrabold text-[#101014]">
                180 km
              </p>
              <p className="text-xs font-medium text-[#101014]/70">de desgaste</p>
            </div>

            <div className="absolute bottom-0 right-[-10%] flex items-center gap-3 rounded-[15px] bg-white p-4 shadow-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F1F1]">
                <img src="/landing/icons/hero-swap.svg" alt="" className="h-5 w-5" />
              </span>
              <div className="whitespace-nowrap">
                <p className="text-sm font-bold text-[#101014]">Transmissão</p>
                <p className="text-xs text-[#8A8D93]">Troca em 200 km</p>
              </div>
              <span className="ml-2 rounded-full bg-[#2E9E5B]/[0.13] px-2.5 py-1 text-xs font-bold text-[#2E9E5B]">
                Em dia
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
