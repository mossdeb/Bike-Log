import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { createCheckoutSession, createPortalSession, reactivateSubscription } from "@/lib/actions/billing";
import type { UserSubscription } from "@/lib/subscription";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function BillingSection({
  subscription,
  dict,
}: {
  subscription: UserSubscription;
  dict: Dictionary["settings"]["billing"];
}) {
  const planLabel = { free: dict.free, personal: dict.personal, pro: dict.pro }[subscription.plan];

  return (
    <div className="space-y-4">
      <div className="rounded-sm bg-muted px-3.5 py-3">
        <p className="text-sm font-bold">
          {dict.currentPlan}: {planLabel}
        </p>
        {subscription.status === "past_due" ? (
          <p className="mt-0.5 text-xs text-destructive">{dict.pastDue}</p>
        ) : (
          subscription.currentPeriodEnd &&
          subscription.plan !== "free" && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd
                ? dict.cancelsOn(formatDate(subscription.currentPeriodEnd))
                : dict.renewsOn(formatDate(subscription.currentPeriodEnd))}
            </p>
          )
        )}
      </div>

      {subscription.plan === "free" ? (
        <div className="flex flex-wrap gap-3">
          <form action={createCheckoutSession}>
            <input type="hidden" name="plan" value="personal" />
            <Button type="submit" variant="outline">
              {dict.upgradeToPersonal}
            </Button>
          </form>
          <form action={createCheckoutSession}>
            <input type="hidden" name="plan" value="pro" />
            <Button type="submit">{dict.upgradeToPro}</Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {subscription.cancelAtPeriodEnd && (
            <form action={reactivateSubscription}>
              <Button type="submit">{dict.reactivate}</Button>
            </form>
          )}
          <form action={createPortalSession}>
            <Button type="submit" variant="outline">
              {dict.manageBilling}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
