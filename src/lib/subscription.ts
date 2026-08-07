import { createClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/plans";

export interface UserSubscription {
  plan: Plan;
  status: "active" | "past_due" | "canceled";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  /** Whether there is a Stripe customer behind this plan. A paid plan can
   * exist without one — a comped account is a row in this table and nothing
   * more — and then everything that hands off to Stripe has nowhere to go.
   * A boolean rather than the ID itself: no caller needs the ID, and it has
   * no business travelling into a component. */
  hasBillingAccount: boolean;
}

const FREE_SUBSCRIPTION: UserSubscription = {
  plan: "free",
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  hasBillingAccount: false,
};

/** No row (never upgraded) or a canceled subscription both mean the free
 * tier. `past_due` still counts as the paid plan — Stripe's Smart Retries
 * are working the payment, access shouldn't drop until it truly cancels. */
export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data || data.status === "canceled") return FREE_SUBSCRIPTION;

  return {
    plan: data.plan as Plan,
    status: data.status as UserSubscription["status"],
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    hasBillingAccount: Boolean(data.stripe_customer_id),
  };
}
