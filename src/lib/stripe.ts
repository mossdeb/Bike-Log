import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Constructed lazily so the app still runs (just without billing) before
 * STRIPE_SECRET_KEY is configured. */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}
