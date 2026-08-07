"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { PLAN_PRICE_IDS, type BillingInterval, type PaidPlan } from "@/lib/plans";

/** Anything that is not an explicit "year" bills monthly, so a form that never
 * heard of intervals keeps behaving exactly as it did. */
function readInterval(formData: FormData): BillingInterval {
  return formData.get("interval") === "year" ? "year" : "month";
}

/**
 * Runs a Stripe call and turns a rejection into `null` plus a log line.
 *
 * Every action here already answers its foreseeable failures with a message on
 * /settings — unknown plan, no billing account, no subscription to switch. The
 * calls to Stripe answered theirs with a 500 and the generic error page, which
 * is the worst of both: the reader learns nothing and neither do we, unless
 * someone goes reading platform logs. It is not a rare path either. Going live
 * sent live price IDs with the test key still in place, and every upgrade in
 * production broke that way until the key was swapped.
 *
 * Only the Stripe call goes inside. `redirect()` works by throwing, so wrapping
 * a block that contains one would swallow the redirect itself.
 */
async function fromStripe<T>(what: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    console.error(`[billing] ${what}`, error);
    return null;
  }
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
  const origin = (await headers()).get("origin");
  const url = await fromStripe("could not create the checkout session", () =>
    createCheckoutSessionUrl({
      userId: user.sub as string,
      email: user.email as string | undefined,
      plan,
      interval,
      origin,
    })
  );

  if (!url) redirect("/settings?error=Could not start checkout");
  redirect(url);
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
  const session = await fromStripe("could not open the billing portal", () =>
    stripe.billingPortal.sessions.create({
      // Non-null past the guard above; the closure loses the narrowing.
      customer: sub.stripe_customer_id!,
      return_url: `${origin}/settings`,
    })
  );

  if (!session) redirect("/settings?error=Could not open billing right now");
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
  const revived = await fromStripe("could not reactivate the subscription", () =>
    stripe.subscriptions.update(sub.stripe_subscription_id!, { cancel_at_period_end: false })
  );
  if (!revived) redirect("/settings?error=Could not reactivate your plan");

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
  const subscription = await fromStripe("could not read the subscription to switch", () =>
    stripe.subscriptions.retrieve(sub.stripe_subscription_id!)
  );
  const item = subscription?.items.data[0];
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

  const switched = await fromStripe("could not switch the plan", () =>
    stripe.subscriptions.update(sub.stripe_subscription_id!, {
      items: [{ id: item.id, price: priceId }],
      proration_behavior: "create_prorations",
    })
  );
  // The row is only moved once Stripe has actually moved: writing the new plan
  // after a failed update would hand out a plan nobody is paying for.
  if (!switched) redirect("/settings?error=Could not change your plan");

  // Reflect it immediately rather than waiting on the webhook round trip.
  await admin.from("subscriptions").update({ plan }).eq("user_id", user.sub as string);

  revalidatePath("/settings");
}
