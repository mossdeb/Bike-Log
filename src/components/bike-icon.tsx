import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBikeAccent } from "@/lib/bike-accent";
import { BIKE_TYPE_ICON } from "@/components/bike-type-icon";
import type { BikeType } from "@/lib/constants";

export function BikeIcon({
  type,
  size = "sm",
  className,
}: {
  type?: string | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const accent = getBikeAccent(type);
  const Icon = BIKE_TYPE_ICON[type as BikeType] ?? Bike;
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
