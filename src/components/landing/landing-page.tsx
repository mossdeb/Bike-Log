import { landingHeadingFont, landingBodyFont } from "@/components/landing/fonts";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingPricing } from "@/components/landing/landing-pricing";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { getLandingDictionary, type LandingLocale } from "@/components/landing/i18n";

export function LandingPage({ locale }: { locale: LandingLocale }) {
  const dict = getLandingDictionary(locale);

  return (
    <div
      id="top"
      className={`${landingHeadingFont.variable} ${landingBodyFont.variable} min-h-screen bg-white font-[family-name:var(--font-landing-body)]`}
    >
      <LandingHeader nav={dict.nav} locale={locale} />
      <LandingHero dict={dict.hero} />
      <LandingFeatures dict={dict.features} />
      <LandingHowItWorks dict={dict.howItWorks} />
      <LandingPricing dict={dict.pricing} />
      <LandingFAQ dict={dict.faq} />
      <LandingCTA dict={dict.cta} />
      <LandingFooter dict={dict.footer} />
    </div>
  );
}
