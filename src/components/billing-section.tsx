import { Button } from "@/components/ui/button";
import { BillingPlanChoice, type PlanOption } from "@/components/billing-plan-choice";
import { formatDate } from "@/lib/format";
import { createPortalSession, reactivateSubscription } from "@/lib/actions/billing";
import type { UserSubscription } from "@/lib/subscription";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export function BillingSection({
  subscription,
  dict,
  cancelLabel,
}: {
  subscription: UserSubscription;
  dict: Dictionary["settings"]["billing"];
  cancelLabel: string;
}) {
  const planLabel = { free: dict.free, personal: dict.personal, pro: dict.pro }[subscription.plan];
  const isFree = subscription.plan === "free";
  /** A paid plan with no Stripe customer behind it — given by hand, not bought.
   * Everything in this card that hands off to Stripe has nowhere to go. */
  const comped = !isFree && !subscription.hasBillingAccount;
  const otherPaidPlan = subscription.plan === "personal" ? "pro" : "personal";
  const otherPlanLabel = otherPaidPlan === "pro" ? dict.pro : dict.personal;

  // On the free plan both paid plans are on offer; on a paid one only the
  // other, which is the plan the switch action has always targeted.
  const options: PlanOption[] = isFree
    ? [
        { plan: "personal", label: dict.upgradeToPersonal, prices: dict.planPrice.personal },
        { plan: "pro", label: dict.upgradeToPro, prices: dict.planPrice.pro },
      ]
    : [
        {
          plan: otherPaidPlan,
          label: otherPaidPlan === "pro" ? dict.switchToPro : dict.switchToPersonal,
          prices: dict.planPrice[otherPaidPlan],
        },
      ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-muted px-3.5 py-3">
        <div>
          <p className="text-sm font-bold">
            {dict.currentPlan}: {planLabel}
          </p>
          {subscription.status === "past_due" ? (
            <p className="mt-0.5 text-xs text-destructive">{dict.pastDue}</p>
          ) : comped ? (
            // The stored period end is left alone rather than blanked: it is
            // simply not this plan's renewal date, because there is nothing
            // renewing it.
            <p className="mt-0.5 text-xs text-muted-foreground">{dict.compedPlan}</p>
          ) : (
            subscription.currentPeriodEnd &&
            !isFree && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {subscription.cancelAtPeriodEnd
                  ? dict.cancelsOn(formatDate(subscription.currentPeriodEnd))
                  : dict.renewsOn(formatDate(subscription.currentPeriodEnd))}
              </p>
            )
          )}
        </div>
        {/* Managing billing belongs to the plan you already have, so it sits in
            the same box as it — and a free plan has no billing to manage.
            Neither does a comped one: a paid row with no Stripe customer behind
            it would send the portal looking for someone who doesn't exist. */}
        {!isFree && !comped && (
          <form action={createPortalSession}>
            <Button type="submit" variant="outline" size="sm">
              {dict.manageBilling}
            </Button>
          </form>
        )}
      </div>

      {!isFree && subscription.cancelAtPeriodEnd ? (
        // Mid-cancellation there is no plan to pick — the one decision left is
        // whether to call the cancellation off.
        <form action={reactivateSubscription}>
          <Button type="submit">{dict.reactivate}</Button>
        </form>
      ) : (
        <BillingPlanChoice
          options={options}
          // Both paths out of this box need a Stripe customer, so a comped
          // account gets the plans shown rather than offered, and a note.
          disabledNote={comped ? dict.compedPlanNote : undefined}
          confirm={
            isFree
              ? undefined
              : {
                  title: dict.switchConfirmTitle(otherPlanLabel),
                  description: dict.switchConfirmDescription,
                  confirmLabel: dict.switchConfirmButton,
                  cancelLabel,
                }
          }
          monthlyLabel={dict.intervalMonthly}
          yearlyLabel={dict.intervalYearly}
          savingLabel={dict.intervalSaving}
        />
      )}
    </div>
  );
}
