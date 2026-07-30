"use client";

import { useEffect, useState } from "react";
import { BIKE_TYPE_ICON } from "@/components/bike-type-icon";
import { cn } from "@/lib/utils";

const ICONS = Object.values(BIKE_TYPE_ICON);

/** Cycles through every bike category icon with a slow crossfade, used to
 * illustrate empty states before the user has picked a bike type yet. */
export function BikeTypeIconCarousel({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ICONS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={cn("relative [&_path]:stroke-[2.5]", className)}>
      {ICONS.map((Icon, i) => (
        <Icon
          key={i}
          className={cn(
            "absolute inset-0 size-full text-foreground transition-opacity duration-700 ease-in-out motion-reduce:transition-none",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}
