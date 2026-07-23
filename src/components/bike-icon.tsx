import { Bike } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBikeAccent } from "@/lib/bike-accent";

export function BikeIcon({
  bikeId,
  size = "sm",
  className,
}: {
  bikeId: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const accent = getBikeAccent(bikeId);
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
      <Bike className={size === "sm" ? "size-5" : "size-7"} />
    </span>
  );
}
