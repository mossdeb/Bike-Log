import Link from "next/link";

const NAV_LINKS = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

export function LandingHeader() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-8 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <img src="/landing/icons/logo.svg" alt="" className="h-[34px] w-[34px]" />
          <span className="font-[family-name:var(--font-landing-heading)] text-base font-bold text-[#101014]">
            BikeLog
          </span>
        </a>

        <nav className="hidden items-center gap-[30px] md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-[#35363C] transition-colors hover:text-[#101014]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-md px-1.5 py-2.5 text-sm font-bold text-[#35363C] hover:text-[#101014]"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#101014] px-4 py-2.5 text-sm font-bold text-[#F5F3EE] transition-opacity hover:opacity-90"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
