import { Cog, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComponentIcon({
  icon: Icon = Cog,
  size = "sm",
  className,
}: {
  icon?: LucideIcon;
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
      <Icon className={size === "sm" ? "size-[18px]" : "size-7"} />
    </span>
  );
}
