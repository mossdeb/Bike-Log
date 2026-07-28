import { cn } from "@/lib/utils";
import { INTERVENTION_TYPE_ICON, type InterventionType } from "@/lib/intervention-type";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export const INTERVENTION_TYPE_STYLES: Record<InterventionType, string> = {
  service: "bg-primary text-primary-foreground",
  repair: "bg-indigo text-indigo-foreground",
  replacement: "bg-emphasis text-emphasis-foreground",
};

/** Solid border + fill for markers (e.g. the history timeline dots) that
 * should match a given intervention type's badge color. */
export const INTERVENTION_TYPE_DOT_STYLES: Record<InterventionType, string> = {
  service: "border-primary bg-primary",
  repair: "border-indigo bg-indigo",
  replacement: "border-emphasis bg-emphasis",
};

export function TypeBadge({ type, dict = getDictionary("en") }: { type: InterventionType; dict?: Dictionary }) {
  const Icon = INTERVENTION_TYPE_ICON[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[7px] px-2.5 py-1 text-xs font-bold",
        INTERVENTION_TYPE_STYLES[type]
      )}
    >
      <Icon className="size-3" />
      {dict.interventionType[type]}
    </span>
  );
}
