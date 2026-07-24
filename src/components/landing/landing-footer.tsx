import Link from "next/link";
import type { LandingDictionary } from "@/components/landing/i18n/en";

export function LandingFooter({ dict }: { dict: LandingDictionary["footer"] }) {
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
            <p className="text-sm leading-relaxed text-[#8A8D93]">{dict.tagline}</p>
          </div>

          <div className="flex gap-14 sm:gap-16">
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A8D93]">{dict.productHeading}</p>
              {dict.productLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-[#101014] hover:text-[#35363C]">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A8D93]">{dict.accountHeading}</p>
              <Link href="/login" className="text-sm text-[#101014] hover:text-[#35363C]">
                {dict.accountLogin}
              </Link>
              <Link href="/signup" className="text-sm text-[#101014] hover:text-[#35363C]">
                {dict.accountSignup}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 text-xs text-[#8A8D93] sm:flex-row sm:items-center sm:justify-between">
          <p>{dict.copyright}</p>
          <p>{dict.madeFor}</p>
        </div>
      </div>
    </footer>
  );
}
