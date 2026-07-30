import Image from "next/image";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/billing";
import { BIKE_TYPE_ICON } from "@/components/bike-type-icon";

const Icon = BIKE_TYPE_ICON.Enduro!;

export function UpgradeToPersonalCard({
  heading,
  feature1,
  feature2,
  price,
  priceUnit,
  cta,
}: {
  heading: string;
  feature1: string;
  feature2: string;
  price: string;
  priceUnit: string;
  cta: string;
}) {
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
        <Icon className="mx-auto mb-4 size-10" />
        <h2 className="text-center font-display text-xl font-extrabold tracking-tight uppercase sm:text-2xl">
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
          <div className="shrink-0 rounded-[12px] bg-white px-5 py-3 text-center">
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
