import Image from "next/image";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/billing";

export function UpgradeToPersonalCard({
  heading,
  feature1,
  feature2,
  price,
  priceUnit,
  cta,
  compact,
}: {
  heading: string;
  feature1: string;
  feature2: string;
  price: string;
  priceUnit: string;
  cta: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="border-t border-border p-3">
        <form action={createCheckoutSession} className="contents">
          <input type="hidden" name="plan" value="personal" />
          <button
            type="submit"
            aria-label={cta}
            className="relative grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 overflow-hidden rounded-lg px-4 py-4 text-left text-foreground transition-opacity hover:opacity-90 sm:grid-cols-[auto_1fr_auto] sm:gap-x-6 sm:gap-y-0 sm:px-5 sm:py-5"
          >
            <Image
              src="/images/upgrade-card-bg.jpg"
              alt=""
              fill
              sizes="100vw"
              className="pointer-events-none object-cover"
            />
            <h2 className="relative col-span-2 font-display text-sm leading-tight font-extrabold tracking-tight uppercase sm:col-span-1 sm:w-36 sm:text-base">
              {cta}
            </h2>
            <ul className="relative flex flex-col gap-1 text-xs font-semibold sm:min-w-0 sm:gap-1.5 sm:text-sm">
              <li className="flex items-center gap-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-5">
                  <Check className="size-2.5 sm:size-3" />
                </span>
                <span className="truncate">{feature1}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-5">
                  <Check className="size-2.5 sm:size-3" />
                </span>
                <span className="truncate">{feature2}</span>
              </li>
            </ul>
            <div className="relative shrink-0 justify-self-end rounded-[12px] bg-white px-2 py-1.5 text-center leading-none sm:px-3 sm:py-2">
              <span className="font-display text-sm font-extrabold text-[#101014] sm:text-base">{price}</span>
              <span className="ml-0.5 text-[10px] text-[#101014]/60">{priceUnit}</span>
            </div>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg px-6 py-8 text-foreground sm:px-8">
      <Image
        src="/images/upgrade-card-bg.jpg"
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="pointer-events-none object-cover"
      />
      <div className="relative">
        <h2 className="text-center font-display text-2xl font-extrabold tracking-tight uppercase sm:text-3xl">
          {heading}
        </h2>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ul className="space-y-2 text-sm font-semibold sm:text-base">
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
              {feature1}
            </li>
            <li className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
              {feature2}
            </li>
          </ul>
          <div className="shrink-0 rounded-[12px] bg-white px-2 py-3 text-center">
            <span className="font-display text-2xl font-extrabold text-[#101014]">{price}</span>
            <span className="ml-1 text-sm text-[#101014]/60">{priceUnit}</span>
          </div>
        </div>

        <form action={createCheckoutSession} className="mt-6">
          <input type="hidden" name="plan" value="personal" />
          <button
            type="submit"
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#101014] text-sm font-semibold text-white transition-colors hover:bg-[#101014]/90"
          >
            {cta}
          </button>
        </form>
      </div>
    </div>
  );
}
