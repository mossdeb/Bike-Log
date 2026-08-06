"use client";

import { useState } from "react";
import { BillingIntervalToggle } from "@/components/billing-interval-toggle";
import { SwitchPlanButton } from "@/components/switch-plan-button";
import { createCheckoutSession, switchPlan } from "@/lib/actions/billing";
import type { BillingInterval, PaidPlan } from "@/lib/plans";

export type PlanPrice = { amount: string; unit: string };

export type PlanOption = {
  plan: PaidPlan;
  label: string;
  prices: Record<BillingInterval, PlanPrice>;
};

/** Price above, plan below. The first option carries the emphasis; the rest sit
 * on the muted surface. */
function cardClassName(emphasis: boolean) {
  return `flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[14px] px-3 py-5 text-center transition-colors sm:px-4 ${
    emphasis
      ? "bg-primary text-primary-foreground hover:bg-primary/80"
      : "bg-muted text-foreground hover:bg-muted/70"
  }`;
}

function CardContents({ price, label }: { price: PlanPrice; label: string }) {
  return (
    <>
      {/* 20px on a phone: at 375px the card gives 89px of content and "€59,99"
          at 24px needs 99. */}
      <span className="font-display text-xl font-extrabold sm:text-2xl">
        {price.amount}
        {/* The period is the smaller half of the price on purpose: it's what
            lets the two cards sit side by side on a phone. */}
        <span className="ml-0.5 text-xs font-medium opacity-60">{price.unit}</span>
      </span>
      <span className="text-base">{label}</span>
    </>
  );
}

/**
 * The plans on offer and the switch that decides what they cost.
 *
 * A client component because of that switch, which is also why every label
 * arrives already resolved: this section's dictionary carries date formatters,
 * and functions cannot cross into a client component.
 */
export function BillingPlanChoice({
  options,
  confirm,
  monthlyLabel,
  yearlyLabel,
  savingLabel,
}: {
  options: PlanOption[];
  /** Present only when the account already pays. Changing plan then is an
   * immediate charge or credit, so it goes through a confirmation rather than
   * straight out to Stripe. */
  confirm?: { title: string; description: string; confirmLabel: string; cancelLabel: string };
  monthlyLabel: string;
  yearlyLabel: string;
  savingLabel: string;
}) {
  const [interval, setInterval] = useState<BillingInterval>("month");

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex justify-center">
        <BillingIntervalToggle
          value={interval}
          onChange={setInterval}
          monthlyLabel={monthlyLabel}
          yearlyLabel={yearlyLabel}
          savingLabel={savingLabel}
        />
      </div>

      <div className={`grid gap-3 ${options.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {options.map((option, index) =>
          confirm ? (
            <SwitchPlanButton
              key={option.plan}
              action={switchPlan}
              plan={option.plan}
              interval={interval}
              triggerClassName={cardClassName(index === 0)}
              triggerLabel={<CardContents price={option.prices[interval]} label={option.label} />}
              title={confirm.title}
              description={confirm.description}
              confirmLabel={confirm.confirmLabel}
              cancelLabel={confirm.cancelLabel}
            />
          ) : (
            <form key={option.plan} action={createCheckoutSession} className="contents">
              <input type="hidden" name="plan" value={option.plan} />
              <input type="hidden" name="interval" value={interval} />
              <button type="submit" className={cardClassName(index === 0)}>
                <CardContents price={option.prices[interval]} label={option.label} />
              </button>
            </form>
          ),
        )}
      </div>
    </div>
  );
}
