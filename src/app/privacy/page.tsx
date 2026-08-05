import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LegalPage } from "@/components/landing/legal-page";
import {
  getLegalDictionary,
  LANDING_LOCALE_COOKIE,
  type LandingLocale,
} from "@/components/landing/i18n";

async function currentLocale(): Promise<LandingLocale> {
  const cookieStore = await cookies();
  return (cookieStore.get(LANDING_LOCALE_COOKIE)?.value as LandingLocale) ?? "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const { privacy } = getLegalDictionary(await currentLocale());
  return { title: privacy.metaTitle, description: privacy.metaDescription };
}

// Deliberately no redirect for signed-in visitors: unlike the landing page, the
// policy has to stay reachable from inside the app and from Google's console.
export default async function PrivacyPage() {
  return <LegalPage locale={await currentLocale()} document="privacy" />;
}
