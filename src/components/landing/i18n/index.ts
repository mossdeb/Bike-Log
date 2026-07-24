import en from "./en";
import pt from "./pt";

export type LandingLocale = "en" | "pt";

const dictionaries = { en, pt };

export function getLandingDictionary(locale: LandingLocale) {
  return dictionaries[locale];
}

export const LANDING_LOCALE_COOKIE = "landing_locale";
