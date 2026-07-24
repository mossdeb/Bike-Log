"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { PLAN_PRICE_IDS, type PaidPlan } from "@/lib/plans";

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) redirect("/login");

  const plan = formData.get("plan") as PaidPlan;
  if (plan !== "personal" && plan !== "pro") {
    redirect("/settings?error=Unknown plan");
  }

  const origin = (await headers()).get("origin");

  const admin = createAdminClient();
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.sub as string)
    .maybeSingle();

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingSub?.stripe_customer_id ?? undefined,
    customer_email: existingSub?.stripe_customer_id ? undefined : (user.email as string),
    client_reference_id: user.sub as string,
    line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
    success_url: `${origin}/settings?checkout=success`,
    cancel_url: `${origin}/settings?checkout=canceled`,
  });

  if (!session.url) redirect("/settings?error=Could not start checkout");
  redirect(session.url);
}

export async function createPortalSession() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) redirect("/login");

  const origin = (await headers()).get("origin");

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.sub as string)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    redirect("/settings?error=No billing account found yet");
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/settings`,
  });

  redirect(session.url);
}
