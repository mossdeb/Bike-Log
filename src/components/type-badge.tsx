import { cn } from "@/lib/utils";

type InterventionType = "service" | "repair" | "replacement";

const STYLES: Record<InterventionType, string> = {
  service: "bg-indigo text-indigo-foreground",
  repair: "bg-primary text-primary-foreground",
  replacement: "bg-emphasis text-emphasis-foreground",
};

export function TypeBadge({ type }: { type: InterventionType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize",
        STYLES[type]
      )}
    >
      {type}
    </span>
  );
}
