import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBikeAccent } from "@/lib/bike-accent";
import { BIKE_TYPE_ICON } from "@/components/bike-type-icon";
import type { BikeType } from "@/lib/constants";

export function BikeIcon({
  type,
  size = "sm",
  plain = false,
  className,
}: {
  type?: string | null;
  size?: "sm" | "lg";
  plain?: boolean;
  className?: string;
}) {
  const Icon = BIKE_TYPE_ICON[type as BikeType] ?? Bike;

  if (plain) {
    return <Icon className={cn(size === "sm" ? "size-[57.2px]" : "size-14", "shrink-0 text-foreground", className)} />;
  }

  const accent = getBikeAccent(type);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        size === "sm" ? "size-10" : "size-14",
        accent.bg,
        accent.fg,
        className
      )}
    >
      <Icon className={size === "sm" ? "size-5" : "size-7"} />
    </span>
  );
}
