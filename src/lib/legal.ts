import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { LANDING_LOCALE_COOKIE, type LandingLocale } from "@/components/landing/i18n";

/**
 * Who is legally responsible for Bikit.
 *
 * Both the privacy policy and the terms render the controller block from here,
 * so this is the only place to change if a company is ever registered — swap
 * `name` for the company name and add whatever registration number applies.
 */
export const LEGAL_ENTITY = {
  name: "Miguel Gomes",
  email: "miguelgomesdzn@gmail.com",
  country: "Portugal",
} as const;

/**
 * Which language to render /privacy and /terms in.
 *
 * These two pages straddle the public site and the signed-in app, and the two
 * halves keep their language in different places. A signed-in reader arriving
 * from Settings must get the language they chose for the app, not whatever the
 * landing page's cookie happens to say; a signed-out reader has only the cookie.
 */
export async function legalLocale(): Promise<LandingLocale> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const language = (data?.claims?.user_metadata as { language?: string } | undefined)?.language;

  if (language) return language === "pt" ? "pt" : "en";

  const cookieStore = await cookies();
  return (cookieStore.get(LANDING_LOCALE_COOKIE)?.value as LandingLocale) ?? "en";
}
