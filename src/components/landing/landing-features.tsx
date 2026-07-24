import type { ReactNode } from "react";

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#43F3AF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-[#101014]">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {children}
    </span>
  );
}

function ComponentRow({
  icon,
  title,
  subtitle,
  last,
}: {
  icon: string;
  title: string;
  subtitle: string;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 py-2.5 ${last ? "" : "border-b border-[#101014]/[0.09]"}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F1F1F1]">
        <img src={icon} alt="" className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-bold text-[#101014]">{title}</p>
        <p className="text-xs text-[#8A8D93]">{subtitle}</p>
      </div>
    </div>
  );
}

function AlertRow({
  icon,
  title,
  subtitle,
  status,
  statusColor,
}: {
  icon: string;
  title: string;
  subtitle: string;
  status: string;
  statusColor: "success" | "warning" | "danger";
}) {
  const colorMap = {
    success: "bg-[#2E9E5B]/[0.13] text-[#2E9E5B]",
    warning: "bg-[#FFAD2D]/[0.16] text-[#B87A0A]",
    danger: "bg-[#E0442F]/[0.13] text-[#E0442F]",
  };
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
        <img src={icon} alt="" className="h-4 w-4 invert" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/50">{subtitle}</p>
      </div>
      <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${colorMap[statusColor]}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status}
      </span>
    </div>
  );
}

const historyEntries = [
  {
    date: "22 jul",
    tag: "Serviço",
    tagColor: "bg-[#6F5BE9] text-white",
    title: "Revisão 62h",
    note: "Oleo e Kit revisão",
    icon: "/landing/icons/badge-service.svg",
  },
  {
    date: "12 May",
    tag: "Substituição",
    tagColor: "bg-[#101014] text-white",
    title: "Retentores",
    note: "",
    icon: "/landing/icons/badge-swap.svg",
  },
  {
    date: "10 jan",
    tag: "Reparação",
    tagColor: "bg-[#43F3AF] text-[#101014]",
    title: "Reparação das Bainhas",
    note: "",
    icon: "/landing/icons/badge-repair.svg",
  },
];

export function LandingFeatures() {
  return (
    <section id="funcionalidades" className="bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex max-w-[620px] flex-col gap-3.5">
          <Badge>Funcionalidades</Badge>
          <h2 className="font-[family-name:var(--font-landing-heading)] text-3xl font-bold leading-tight tracking-tight text-[#101014] sm:text-[36.8px]">
            Tudo o que precisas para cuidar da tua bicicleta
          </h2>
          <p className="text-base leading-relaxed text-[#35363C] sm:text-[16.3px]">
            Sem folhas de cálculo, sem post-its na garagem. Um sítio só para as tuas bicicletas, os teus
            componentes e o histórico de tudo o que lhes fizeste.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          {/* Card 1 - green */}
          <div className="grid grid-cols-1 items-center gap-10 rounded-[32px] bg-[#43F3AF] p-6 sm:p-12 md:grid-cols-2">
            <div className="rounded-[22px] bg-white p-5 shadow-lg">
              <p className="mb-1 text-sm font-bold text-[#101014] opacity-85">Componentes — A minha Bicicleta</p>
              <div className="mt-4">
                <ComponentRow icon="/landing/icons/shock.svg" title="Amortecedor — Fox Float X2" subtitle="Instalado há 8 meses" />
                <ComponentRow icon="/landing/icons/disc.svg" title="Travões — Shimano XT" subtitle="Instalado há 2 meses" />
                <ComponentRow icon="/landing/icons/chain.svg" title="Corrente — SRAM GX" subtitle="Instalada há 3 meses" last />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <img src="/landing/icons/wrench-mountain.svg" alt="" className="h-8 w-9" />
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-[#101014] sm:text-[28px]">
                Cada bicicleta, cada componente, num só sítio
              </h3>
              <p className="text-[15px] leading-relaxed text-[#101014]/85">
                Cria um perfil para cada bicicleta e regista suspensão, travões, transmissão, rodas — tudo. Sabes
                sempre o que tens montado e há quanto tempo está lá.
              </p>
            </div>
          </div>

          {/* Card 2 - dark */}
          <div className="grid grid-cols-1 items-center gap-10 rounded-[32px] bg-[#1C1C1C] p-6 sm:p-12 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <img src="/landing/icons/bell.svg" alt="" className="h-8 w-7" />
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-white sm:text-[28px]">
                Alertas antes que seja tarde
              </h3>
              <p className="max-w-[400px] text-[15px] leading-relaxed text-white/85">
                Define intervalos de manutenção por componente. O BikeLog acompanha os quilómetros e os meses, e
                avisa-te quando algo se aproxima do limite.
              </p>
            </div>
            <div className="rounded-[22px] bg-white/[0.06] p-5">
              <p className="mb-1 text-sm font-bold text-white/60">Precisa de atenção</p>
              <div className="mt-3 divide-y divide-white/10">
                <AlertRow icon="/landing/icons/tire.svg" title="Pneus — Trek Domane" subtitle="Ok, revisto há 1 mês" status="Em dia" statusColor="success" />
                <AlertRow icon="/landing/icons/chain.svg" title="Corrente — Peugeot Gravel" subtitle="Desgaste a 0.5% do limite" status="Em breve" statusColor="warning" />
                <AlertRow icon="/landing/icons/disc.svg" title="Travões — Canyon Spectral" subtitle="Serviço vencido há 12 dias" status="Atrasado" statusColor="danger" />
              </div>
            </div>
          </div>

          {/* Card 3 - light */}
          <div className="grid grid-cols-1 items-center gap-10 rounded-[32px] border border-[#E9EBF6] bg-[#E9EBF6] p-6 sm:p-12 md:grid-cols-2">
            <div className="relative pt-8">
              <div className="absolute -top-2 left-10 z-10 flex items-center gap-2.5 rounded-[15px] bg-white p-3.5 shadow-xl">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#F1F1F1]">
                  <img src="/landing/icons/shock.svg" alt="" className="h-3.5 w-3.5" />
                </span>
                <p className="whitespace-nowrap text-sm font-bold text-[#101014]">fox float x2</p>
                <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2E9E5B]/[0.13] px-2.5 py-1 text-xs font-bold text-[#2E9E5B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Revisão até 22 Jan 2027
                </span>
              </div>
              <div className="rounded-[22px] bg-white p-5 shadow-lg">
                <p className="mb-2 text-sm font-bold text-[#101014]">Histórico</p>
                <div className="mt-2 divide-y divide-[#101014]/[0.06]">
                  {historyEntries.map((entry) => (
                    <div key={entry.title} className="flex items-center gap-3 py-3">
                      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F1F1F1] text-xs font-bold text-[#101014]">
                        {entry.date}
                      </span>
                      <div>
                        <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${entry.tagColor}`}>
                          <img src={entry.icon} alt="" className="h-2.5 w-2.5" />
                          {entry.tag}
                        </span>
                        <p className="text-sm font-bold text-[#101014]">{entry.title}</p>
                        {entry.note && <p className="text-xs text-[#8A8D93]">{entry.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-[family-name:var(--font-landing-heading)] text-2xl font-bold leading-snug text-[#101014] sm:text-[28px]">
                Histórico completo de intervenções
              </h3>
              <p className="text-[15px] leading-relaxed text-[#35363C]">
                Serviço, reparação ou substituição — cada intervenção fica registada, com data, quilómetros e
                notas. O histórico da tua bicicleta nunca se perde.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
