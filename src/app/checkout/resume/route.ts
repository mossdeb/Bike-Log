import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { createCheckoutSessionUrl } from "@/lib/checkout";
import { CHECKOUT_INTENT_COOKIE, parseCheckoutIntent } from "@/lib/checkout-intent";

/**
 * Picks up the plan chosen on the landing page once the account exists, and
 * hands the new subscriber to Stripe.
 *
 * The intent cookie is cleared on **every** path out of here, the failures
 * included: the dashboard redirects here whenever the cookie is present, so a
 * cookie that survived a failure would bounce the two of them forever.
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);

  const backToDashboard = () => {
    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.delete(CHECKOUT_INTENT_COOKIE);
    return response;
  };

  const intent = parseCheckoutIntent(request.cookies.get(CHECKOUT_INTENT_COOKIE)?.value);
  if (!intent) return backToDashboard();

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getClaims();
  const user = userData?.claims;
  // The proxy already turns anonymous requests away, so this is belt and
  // braces — but it must not drop into checkout without a user.
  if (!user) return backToDashboard();

  // Someone who already pays picked this plan before signing up and has since
  // subscribed by another route; a second checkout would be a second
  // subscription.
  const subscription = await getUserSubscription(user.sub as string);
  if (subscription.plan !== "free") return backToDashboard();

  let url: string | null = null;
  try {
    url = await createCheckoutSessionUrl({
      userId: user.sub as string,
      email: user.email as string | undefined,
      plan: intent.plan,
      interval: intent.interval,
      origin,
    });
  } catch (error) {
    console.error("[checkout/resume] could not create the checkout session", error);
  }

  if (!url) return backToDashboard();

  const response = NextResponse.redirect(url);
  response.cookies.delete(CHECKOUT_INTENT_COOKIE);
  return response;
}
