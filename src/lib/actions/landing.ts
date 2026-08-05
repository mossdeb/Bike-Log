"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANDING_LOCALE_COOKIE } from "@/components/landing/i18n";

export async function setLandingLocale(formData: FormData) {
  const locale = formData.get("locale") === "pt" ? "pt" : "en";
  const cookieStore = await cookies();
  cookieStore.set(LANDING_LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  // "layout" so the switch also reaches /privacy and /terms, which read the same
  // cookie — a plain revalidatePath("/") only refreshes the landing page itself.
  revalidatePath("/", "layout");
}
