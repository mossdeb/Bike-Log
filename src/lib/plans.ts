export type Plan = "free" | "personal" | "pro";
export type PaidPlan = Extract<Plan, "personal" | "pro">;

export const PLAN_LIMITS: Record<Plan, { maxBikes: number | null; maxComponents: number | null }> = {
  free: { maxBikes: 1, maxComponents: 2 },
  personal: { maxBikes: 3, maxComponents: null },
  pro: { maxBikes: null, maxComponents: null },
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
