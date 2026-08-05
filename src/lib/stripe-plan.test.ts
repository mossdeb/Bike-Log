import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type Stripe from "stripe";

const PERSONAL_PRICE = "price_personal_current";
const PRO_PRICE = "price_pro_current";
const PERSONAL_PRODUCT = "prod_personal";
const PRO_PRODUCT = "prod_pro";

/** Only the fields the resolver reads. */
function subscriptionWith(price: { id: string; product: string }) {
  return { items: { data: [{ price }] } } as unknown as Stripe.Subscription;
}

async function loadResolver() {
  // The plan maps are built from env vars at module load, so the env has to be
  // in place before the import and the module registry reset between cases.
  vi.resetModules();
  return (await import("./stripe-plan")).resolvePlanFromSubscription;
}

describe("resolvePlanFromSubscription", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_PRICE_PERSONAL", PERSONAL_PRICE);
    vi.stubEnv("STRIPE_PRICE_PRO", PRO_PRICE);
    vi.stubEnv("STRIPE_PRODUCT_PERSONAL", PERSONAL_PRODUCT);
    vi.stubEnv("STRIPE_PRODUCT_PRO", PRO_PRODUCT);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves a current price straight from the env vars", async () => {
    const resolve = await loadResolver();
    expect(resolve(subscriptionWith({ id: PRO_PRICE, product: PRO_PRODUCT }))).toBe("pro");
  });

  // The regression this module exists for: a subscriber left on last year's
  // price used to be read as "free" and lose their plan without any error.
  it("falls back to the product when the price ID is no longer configured", async () => {
    const resolve = await loadResolver();
    const rotatedAway = subscriptionWith({ id: "price_archived_last_year", product: PERSONAL_PRODUCT });
    expect(resolve(rotatedAway)).toBe("personal");
  });

  it("returns null — never a downgrade — when neither price nor product is known", async () => {
    const resolve = await loadResolver();
    const foreign = subscriptionWith({ id: "price_someone_elses", product: "prod_someone_elses" });
    expect(resolve(foreign)).toBeNull();
  });

  it("returns null when the product env vars are unset and the price is unknown", async () => {
    vi.stubEnv("STRIPE_PRODUCT_PERSONAL", "");
    vi.stubEnv("STRIPE_PRODUCT_PRO", "");
    const resolve = await loadResolver();
    expect(resolve(subscriptionWith({ id: "price_archived", product: PERSONAL_PRODUCT }))).toBeNull();
  });

  // An empty env var makes the map key "", which must not become a wildcard
  // that matches a subscription item with no product.
  it("does not match an empty product ID against an unset env var", async () => {
    vi.stubEnv("STRIPE_PRODUCT_PERSONAL", "");
    const resolve = await loadResolver();
    expect(resolve(subscriptionWith({ id: "price_unknown", product: "" }))).toBeNull();
  });

  it("returns null for a subscription with no items", async () => {
    const resolve = await loadResolver();
    expect(resolve({ items: { data: [] } } as unknown as Stripe.Subscription)).toBeNull();
  });
});
