import { cn } from "@/lib/utils";
import { INTERVENTION_TYPE_ICON, type InterventionType } from "@/lib/intervention-type";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const STYLES: Record<InterventionType, string> = {
  service: "bg-indigo text-indigo-foreground",
  repair: "bg-primary text-primary-foreground",
  replacement: "bg-emphasis text-emphasis-foreground",
};

export function TypeBadge({ type, dict = getDictionary("en") }: { type: InterventionType; dict?: Dictionary }) {
  const Icon = INTERVENTION_TYPE_ICON[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        STYLES[type]
      )}
    >
      <Icon className="size-3" />
      {dict.interventionType[type]}
    </span>
  );
}
