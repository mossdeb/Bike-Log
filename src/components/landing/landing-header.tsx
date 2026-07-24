import Link from "next/link";
import { LandingLocaleSwitcher } from "@/components/landing/landing-locale-switcher";
import type { LandingDictionary } from "@/components/landing/i18n/en";
import type { LandingLocale } from "@/components/landing/i18n";

export function LandingHeader({
  nav,
  locale,
}: {
  nav: LandingDictionary["nav"];
  locale: LandingLocale;
}) {
  const NAV_LINKS = [
    { label: nav.features, href: "#funcionalidades" },
    { label: nav.howItWorks, href: "#como-funciona" },
    { label: nav.pricing, href: "#precos" },
    { label: nav.faq, href: "#faq" },
  ];

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

        <div className="flex items-center gap-3">
          <LandingLocaleSwitcher locale={locale} />
          <Link
            href="/login"
            className="rounded-md px-1.5 py-2.5 text-sm font-bold text-[#35363C] hover:text-[#101014]"
          >
            {nav.login}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#101014] px-4 py-2.5 text-sm font-bold text-[#F5F3EE] transition-opacity hover:opacity-90"
          >
            {nav.getStarted}
          </Link>
        </div>
      </div>
    </header>
  );
}
