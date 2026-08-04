"use client";

import { setLandingLocale } from "@/lib/actions/landing";
import type { LandingLocale } from "@/components/landing/i18n";

/** Shows the language it switches to, not the one in use — the circle is the action. */
export function LandingLocaleSwitcher({ locale, label }: { locale: LandingLocale; label: string }) {
  const next: LandingLocale = locale === "en" ? "pt" : "en";

  return (
    <form action={setLandingLocale}>
      {/* 44px of tap target around a 25px circle; the negative margin keeps the
          button occupying only the circle's space, so header spacing is unchanged. */}
      <button
        type="submit"
        name="locale"
        value={next}
        aria-label={label}
        className="-m-[9.5px] flex h-11 w-11 cursor-pointer items-center justify-center transition-opacity hover:opacity-90"
      >
        <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#101014] text-[12px] font-bold uppercase leading-none text-[#F5F3EE]">
          {next}
        </span>
      </button>
    </form>
  );
}
