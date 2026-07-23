import { Cog } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export function ComponentIcon({
  icon: Icon = Cog,
  size = "sm",
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
        size === "sm" ? "size-10" : "size-14",
        className
      )}
    >
      <Icon className={size === "sm" ? "size-[22px]" : "size-[34px]"} />
    </span>
  );
}
