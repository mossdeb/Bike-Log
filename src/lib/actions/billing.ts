"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { PLAN_PRICE_IDS, type BillingInterval, type PaidPlan } from "@/lib/plans";

/** Anything that is not an explicit "year" bills monthly, so a form that never
 * heard of intervals keeps behaving exactly as it did. */
function readInterval(formData: FormData): BillingInterval {
  return formData.get("interval") === "year" ? "year" : "month";
}

export async function createCheckoutSession(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  if (!user) redirect("/login");

  const plan = formData.get("plan") as PaidPlan;
  if (plan !== "personal" && plan !== "pro") {
    redirect("/settings?error=Unknown plan");
  }

  const interval = readInterval(formData);
  const priceId = PLAN_PRICE_IDS[plan][interval];
  if (!priceId) {
    redirect("/settings?error=That billing period is not available yet");
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
    line_items: [{ price: priceId, quantity: 1 }],
    // Without this the promotion-code box does not exist in Checkout at all,
    // and a voucher can only be applied by attaching the coupon to the
    // customer by hand in the dashboard.
    allow_promotion_codes: true,
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
 * isn't configurable through the API.
 *
 * The billing interval carries over from the subscription being replaced
 * unless the form names one: someone paying yearly who moves to the other plan
 * means to keep paying yearly, and reading the interval off the current price
 * gets that right without storing it anywhere. */
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
  const item = subscription.items.data[0];
  if (!item) redirect("/settings?error=Could not find your subscription item");

  const interval: BillingInterval = formData.has("interval")
    ? readInterval(formData)
    : item.price.recurring?.interval === "year"
      ? "year"
      : "month";

  const priceId = PLAN_PRICE_IDS[plan][interval];
  if (!priceId) {
    redirect("/settings?error=That billing period is not available yet");
  }

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: item.id, price: priceId }],
    proration_behavior: "create_prorations",
  });

  // Reflect it immediately rather than waiting on the webhook round trip.
  await admin.from("subscriptions").update({ plan }).eq("user_id", user.sub as string);

  revalidatePath("/settings");
}
