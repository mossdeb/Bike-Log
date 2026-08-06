import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/landing/landing-page";
import { PublicAnalytics } from "@/components/public-analytics";
import { LANDING_LOCALE_COOKIE, type LandingLocale } from "@/components/landing/i18n";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) redirect("/dashboard");

  const cookieStore = await cookies();
  const locale = (cookieStore.get(LANDING_LOCALE_COOKIE)?.value as LandingLocale) ?? "en";

  return (
    <>
      <LandingPage locale={locale} />
      <PublicAnalytics />
    </>
  );
}
