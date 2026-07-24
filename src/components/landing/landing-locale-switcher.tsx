"use client";

import { setLandingLocale } from "@/lib/actions/landing";
import type { LandingLocale } from "@/components/landing/i18n";

export function LandingLocaleSwitcher({ locale }: { locale: LandingLocale }) {
  return (
    <form
      action={setLandingLocale}
      className="flex items-center overflow-hidden rounded-full border border-[#101014]/[0.12] text-[11px] font-bold"
    >
      <button
        type="submit"
        name="locale"
        value="en"
        className={`px-2 py-1 transition-colors ${
          locale === "en" ? "bg-[#101014] text-white" : "text-[#35363C] hover:text-[#101014]"
        }`}
      >
        EN
      </button>
      <button
        type="submit"
        name="locale"
        value="pt"
        className={`px-2 py-1 transition-colors ${
          locale === "pt" ? "bg-[#101014] text-white" : "text-[#35363C] hover:text-[#101014]"
        }`}
      >
        PT
      </button>
    </form>
  );
}
