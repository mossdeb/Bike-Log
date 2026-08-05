import type Stripe from "stripe";
// Relative, not the "@/" alias: there is no vitest.config.ts, so the alias
// does not resolve under the test runner.
import { PRICE_TO_PLAN, PRODUCT_TO_PLAN, type PaidPlan } from "./plans";

/**
 * Which plan a Stripe subscription grants.
 *
 * Returns `null` when it cannot be determined — deliberately not "free".
 * Reading an unrecognised price as the free plan is how a paying subscriber
 * loses their plan in silence: prices are immutable, so every price change
 * creates a new ID, and the moment an old ID stops being named by the env vars
 * every subscriber still on it gets downgraded by the next webhook that
 * touches them. Callers must decide what to do with `null`, and none of them
 * may treat it as a downgrade.
 *
 * Resolution order:
 *   1. the price ID, straight from the env vars;
 *   2. the price's product, which survives price rotation.
 *
 * No network call: Stripe sends the price object inline on subscription
 * events, with `product` as a plain ID, so both lookups are local.
 */
export function resolvePlanFromSubscription(subscription: Stripe.Subscription): PaidPlan | null {
  const price = subscription.items.data[0]?.price;
  if (!price) return null;

  const byPrice = PRICE_TO_PLAN[price.id];
  if (byPrice) return byPrice;

  const productId = typeof price.product === "string" ? price.product : price.product?.id;
  if (!productId) return null;

  return PRODUCT_TO_PLAN[productId] ?? null;
}
