import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { PublicAnalytics } from "@/components/public-analytics";
import { getLegalDictionary } from "@/components/landing/i18n";
import { legalLocale } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { privacy } = getLegalDictionary(await legalLocale());
  return { title: privacy.metaTitle, description: privacy.metaDescription };
}

// Deliberately no redirect for signed-in visitors: unlike the landing page, the
// policy has to stay reachable from inside the app and from Google's console.
export default async function PrivacyPage() {
  return (
    <>
      <LegalPage locale={await legalLocale()} document="privacy" />
      <PublicAnalytics />
    </>
  );
}
