import en from "./dictionaries/en";
import pt from "./dictionaries/pt";

export type Locale = "en" | "pt";

const dictionaries = { en, pt };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Reads the language preference off an already-fetched user_metadata object
 * (avoids a second auth round trip on pages that already call getClaims()). */
export function localeFromMetadata(metadata: unknown): Locale {
  const language = (metadata as { language?: string } | null | undefined)?.language;
  return language === "pt" ? "pt" : "en";
}
