import { BILLING_INTERVALS, type BillingInterval, type PaidPlan } from "@/lib/plans";

/**
 * The plan someone picked on the landing page, carried across signing up.
 *
 * A cookie rather than a query string because there are four ways into the
 * app and three of them destroy query params on the way: the password signup
 * leaves through a confirmation email, Google bounces through Google, and both
 * `login` and `resetPassword` redirect to a hardcoded /dashboard. A cookie
 * survives all four without any of them having to know this exists.
 */
export const CHECKOUT_INTENT_COOKIE = "bikit_checkout_intent";

/** Long enough to outlast waiting on a confirmation email, short enough that a
 * plan picked last week doesn't ambush someone signing in today. */
export const CHECKOUT_INTENT_MAX_AGE = 60 * 60 * 24;

export type CheckoutIntent = { plan: PaidPlan; interval: BillingInterval };

const PAID_PLANS: PaidPlan[] = ["personal", "pro"];

export function isPaidPlan(value: string | null | undefined): value is PaidPlan {
  return PAID_PLANS.includes(value as PaidPlan);
}

export function isBillingInterval(value: string | null | undefined): value is BillingInterval {
  return BILLING_INTERVALS.includes(value as BillingInterval);
}

export function serializeCheckoutIntent(intent: CheckoutIntent): string {
  return `${intent.plan}:${intent.interval}`;
}

/** Anything unrecognised reads as "no intent" rather than as a default: this
 * value comes off a cookie the user can edit, and guessing on their behalf
 * would send someone to a checkout they never asked for. */
export function parseCheckoutIntent(value: string | null | undefined): CheckoutIntent | null {
  const [plan, interval] = (value ?? "").split(":");
  if (!isPaidPlan(plan) || !isBillingInterval(interval)) return null;
  return { plan, interval };
}
