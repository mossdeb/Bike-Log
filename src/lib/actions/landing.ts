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
  revalidatePath("/");
}
