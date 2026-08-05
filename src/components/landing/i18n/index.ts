import en from "./en";
import pt from "./pt";
import legalEn from "./legal-en";
import legalPt from "./legal-pt";

export type LandingLocale = "en" | "pt";

const dictionaries = { en, pt };
const legalDictionaries = { en: legalEn, pt: legalPt };

export function getLandingDictionary(locale: LandingLocale) {
  return dictionaries[locale];
}

export function getLegalDictionary(locale: LandingLocale) {
  return legalDictionaries[locale];
}

export const LANDING_LOCALE_COOKIE = "landing_locale";
