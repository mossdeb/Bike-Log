import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePlanFromSubscription } from "@/lib/stripe-plan";

export const dynamic = "force-dynamic";

function statusFromStripe(status: Stripe.Subscription.Status): "active" | "past_due" | "canceled" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled" || status === "unpaid") return "canceled";
  return "past_due";
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId || !session.subscription || !session.customer) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const plan = resolvePlanFromSubscription(subscription);
      const periodEnd = subscription.items.data[0]?.current_period_end;

      // The price came from our own PLAN_PRICE_IDS when the session was
      // created, so an unknown one here means the env vars are misconfigured.
      // Recording "free" would hand a paying customer nothing; leaving the row
      // out at least keeps the record from being wrong, and the log names the
      // price so it can be traced.
      if (!plan) {
        console.error(
          `[stripe] checkout completed with an unrecognised price: ${subscription.items.data[0]?.price.id} (subscription ${subscription.id}, user ${userId}) — plan not recorded`
        );
        break;
      }

      await admin.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        plan,
        status: statusFromStripe(subscription.status),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const plan = resolvePlanFromSubscription(subscription);
      const periodEnd = subscription.items.data[0]?.current_period_end;

      // This is the path that used to downgrade people. An unrecognised price
      // says nothing about what the subscriber is entitled to, so the plan is
      // left exactly as it is and only the billing state is updated.
      if (!plan) {
        console.error(
          `[stripe] subscription updated with an unrecognised price: ${subscription.items.data[0]?.price.id} (subscription ${subscription.id}) — plan left unchanged`
        );
      }

      await admin
        .from("subscriptions")
        .update({
          ...(plan ? { plan } : {}),
          status: statusFromStripe(subscription.status),
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await admin
        .from("subscriptions")
        .update({ plan: "free", status: "canceled", cancel_at_period_end: false })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      break;
  }

  return Response.json({ received: true });
}
