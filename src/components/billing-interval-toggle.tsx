"use client";

import type { BillingInterval } from "@/lib/plans";

/** Monthly/yearly segmented control, shared by the settings billing section and
 * the upgrade card so the two never drift apart. Labels arrive resolved: the
 * dictionary section this reads from is handed to client components whole. */
export function BillingIntervalToggle({
  value,
  onChange,
  monthlyLabel,
  yearlyLabel,
  savingLabel,
  tone = "light",
}: {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  monthlyLabel: string;
  yearlyLabel: string;
  savingLabel: string;
  tone?: "light" | "onImage";
}) {
  const intervals: BillingInterval[] = ["month", "year"];

  return (
    <div
      className={`inline-flex w-fit items-center gap-1 rounded-full p-1 ${
        tone === "onImage" ? "bg-white/80" : "border border-border bg-muted"
      }`}
    >
      {intervals.map((interval) => {
        const selected = value === interval;
        return (
          <button
            key={interval}
            type="button"
            onClick={() => onChange(interval)}
            aria-pressed={selected}
            // 20px line box + 24px of padding is the 44px touch target the
            // rest of the app holds small controls to.
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
              selected
                ? "bg-foreground text-background"
                : tone === "onImage"
                  ? "text-[#101014]/70 hover:text-[#101014]"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {interval === "year" ? yearlyLabel : monthlyLabel}
            {interval === "year" && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                {savingLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
