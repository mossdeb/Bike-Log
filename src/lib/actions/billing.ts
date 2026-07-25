"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

/** Undoes a scheduled "cancel at period end" — the subscription keeps
 * running as normal. Only reachable while still inside the grace period;
 * once it fully lapses the user is back on the free plan and upgrades via
 * createCheckoutSession instead. */
export async function reactivateSubscription() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.sub as string)
    .maybeSingle();

  if (!sub?.stripe_subscription_id) {
    redirect("/settings?error=No subscription found to reactivate");
  }

  const stripe = getStripeClient();
  await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: false });

  // Reflect it immediately rather than waiting on the webhook round trip.
  await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: false })
    .eq("user_id", user.sub as string);

  revalidatePath("/settings");
}

/** Switches between the two paid plans directly (Stripe prorates
 * automatically), without going through the Customer Portal — the
 * portal's own "update subscription" option isn't enabled by default and
 * isn't configurable through the API. */
export async function switchPlan(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) redirect("/login");

  const plan = formData.get("plan") as PaidPlan;
  if (plan !== "personal" && plan !== "pro") {
    redirect("/settings?error=Unknown plan");
  }

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.sub as string)
    .maybeSingle();

  if (!sub?.stripe_subscription_id) {
    redirect("/settings?error=No subscription found to switch");
  }

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) redirect("/settings?error=Could not find your subscription item");

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: itemId, price: PLAN_PRICE_IDS[plan] }],
    proration_behavior: "create_prorations",
  });

  // Reflect it immediately rather than waiting on the webhook round trip.
  await admin.from("subscriptions").update({ plan }).eq("user_id", user.sub as string);

  revalidatePath("/settings");
}
