import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

const ACCOUNT_LINKS = [
  { label: "Entrar", href: "/login" },
  { label: "Criar conta", href: "/signup" },
];

export function LandingFooter() {
  return (
    <footer className="bg-white px-4 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1160px]">
        <div className="flex flex-col gap-9 border-b border-[#101014]/[0.09] pb-9 sm:flex-row sm:justify-between">
          <div className="flex max-w-[280px] flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <img src="/landing/icons/logo.svg" alt="" className="h-[34px] w-[34px]" />
              <span className="font-[family-name:var(--font-landing-heading)] text-base font-bold text-[#101014]">
                BikeLog
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#8A8D93]">
              Manutenção de bicicletas, sem folhas de cálculo. A ferramenta definitiva para ciclistas que cuidam
              das suas máquinas.
            </p>
          </div>

          <div className="flex gap-14 sm:gap-16">
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A8D93]">Produto</p>
              {PRODUCT_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-[#101014] hover:text-[#35363C]">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A8D93]">Conta</p>
              {ACCOUNT_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-[#101014] hover:text-[#35363C]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 text-xs text-[#8A8D93] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BikeLog. Todos os direitos reservados.</p>
          <p>Feito para quem gosta de cuidar da própria bicicleta.</p>
        </div>
      </div>
    </footer>
  );
}
