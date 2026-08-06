import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CHECKOUT_INTENT_COOKIE,
  CHECKOUT_INTENT_MAX_AGE,
  isBillingInterval,
  isPaidPlan,
  serializeCheckoutIntent,
} from "@/lib/checkout-intent";

/**
 * Entry point for the landing page's paid CTAs: remembers which plan and
 * billing period were picked, then hands over to signing up.
 *
 * A route handler and not the signup page itself because Server Components
 * cannot set cookies — only route handlers and server functions can.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const plan = searchParams.get("plan");
  const interval = searchParams.get("interval");

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const signedIn = Boolean(userData?.claims);

  // Someone already signed in has no signup to go through, so the intent has
  // nothing to survive — send them straight to the checkout hand-off.
  const response = NextResponse.redirect(`${origin}${signedIn ? "/checkout/resume" : "/signup"}`);

  if (isPaidPlan(plan) && isBillingInterval(interval)) {
    response.cookies.set(CHECKOUT_INTENT_COOKIE, serializeCheckoutIntent({ plan, interval }), {
      httpOnly: true,
      // "lax" and not "strict": the return leg from Google OAuth and from a
      // confirmation email are both top-level cross-site navigations, and
      // "strict" would withhold the cookie on exactly those two.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CHECKOUT_INTENT_MAX_AGE,
    });
  }

  return response;
}
