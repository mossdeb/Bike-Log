export type Plan = "free" | "personal" | "pro";
export type PaidPlan = Extract<Plan, "personal" | "pro">;

export const PLAN_LIMITS: Record<Plan, { maxBikes: number | null; maxComponents: number | null }> = {
  free: { maxBikes: 1, maxComponents: 2 },
  personal: { maxBikes: 3, maxComponents: null },
  pro: { maxBikes: null, maxComponents: null },
};

/**
 * What a plan can do, as opposed to how much of it. Kept apart from
 * PLAN_LIMITS because a limit is a number the UI counts against and a feature
 * is a door that is either open or shut.
 */
export const PLAN_FEATURES: Record<Plan, { timeline: boolean }> = {
  free: { timeline: false },
  personal: { timeline: true },
  pro: { timeline: true },
};

// Stripe test-mode price IDs (Bikit Personal / Bikit Pro, sandbox account).
export const PLAN_PRICE_IDS: Record<PaidPlan, string> = {
  personal: process.env.STRIPE_PRICE_PERSONAL ?? "",
  pro: process.env.STRIPE_PRICE_PRO ?? "",
};

export const PRICE_TO_PLAN: Record<string, PaidPlan> = {
  [PLAN_PRICE_IDS.personal]: "personal",
  [PLAN_PRICE_IDS.pro]: "pro",
};

/**
 * Products, unlike prices, survive a price change: Stripe prices are immutable,
 * so raising a price means creating a new one and archiving the old, but both
 * keep pointing at the same product. That makes the product the stable identity
 * of a plan, and it is what saves a subscriber whose price ID has since been
 * rotated out of the env vars.
 *
 * Optional: with these unset the price map still resolves every current
 * subscriber, and an unrecognised price is treated as unknown rather than as
 * the free plan.
 */
export const PLAN_PRODUCT_IDS: Record<PaidPlan, string> = {
  personal: process.env.STRIPE_PRODUCT_PERSONAL ?? "",
  pro: process.env.STRIPE_PRODUCT_PRO ?? "",
};

export const PRODUCT_TO_PLAN: Record<string, PaidPlan> = {
  [PLAN_PRODUCT_IDS.personal]: "personal",
  [PLAN_PRODUCT_IDS.pro]: "pro",
};
