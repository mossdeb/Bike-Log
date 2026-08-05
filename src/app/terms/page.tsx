import type { Metadata } from "next";
import { LegalPage } from "@/components/landing/legal-page";
import { getLegalDictionary } from "@/components/landing/i18n";
import { legalLocale } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const { terms } = getLegalDictionary(await legalLocale());
  return { title: terms.metaTitle, description: terms.metaDescription };
}

// Deliberately no redirect for signed-in visitors: unlike the landing page, the
// terms have to stay reachable from inside the app and from Google's console.
export default async function TermsPage() {
  return <LegalPage locale={await legalLocale()} document="terms" />;
}
