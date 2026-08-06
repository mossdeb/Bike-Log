import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe";
import { PLAN_PRICE_IDS, type BillingInterval, type PaidPlan } from "@/lib/plans";

/**
 * Creates the Stripe Checkout session and hands back its URL, or null when the
 * plan has no price configured for that interval.
 *
 * Lives here rather than in the billing actions file because that one is
 * "use server": every export there becomes a callable server action, and this
 * is a helper, not an endpoint.
 */
export async function createCheckoutSessionUrl({
  userId,
  email,
  plan,
  interval,
  origin,
}: {
  userId: string;
  email: string | undefined;
  plan: PaidPlan;
  interval: BillingInterval;
  origin: string | null;
}): Promise<string | null> {
  const priceId = PLAN_PRICE_IDS[plan][interval];
  if (!priceId) return null;

  const admin = createAdminClient();
  const { data: existingSub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingSub?.stripe_customer_id ?? undefined,
    customer_email: existingSub?.stripe_customer_id ? undefined : email,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    // Without this the promotion-code box does not exist in Checkout at all,
    // and a voucher can only be applied by attaching the coupon to the
    // customer by hand in the dashboard.
    allow_promotion_codes: true,
    success_url: `${origin}/settings?checkout=success`,
    cancel_url: `${origin}/settings?checkout=canceled`,
  });

  return session.url ?? null;
}
