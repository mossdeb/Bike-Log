import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BikeTypeIconCarousel } from "@/components/bike-type-icon-carousel";

export function NewToBikitCard({
  heading,
  cta,
  compact,
  className,
}: {
  heading: string;
  cta: string;
  /** Sizes the card to match the height of a populated bike card (used on
   * the bikes list, which has no carousel of other cards to stretch against). */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg bg-card px-6 text-center",
        compact ? "h-[217px]" : "py-14",
        className
      )}
    >
      <BikeTypeIconCarousel className={compact ? "h-[72px] w-[84px]" : "h-24 w-28"} />
      <p className="text-[16px] font-semibold">{heading}</p>
      <Button
        render={<Link href="/bikes/new" />}
        nativeButton={false}
        variant="outline"
        size="lg"
        className="h-[52px] w-[80%] border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background"
      >
        {cta}
      </Button>
    </div>
  );
}
