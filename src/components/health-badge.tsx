import { classifyHealth, type HealthLevel } from "@/lib/maintenance/health";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

const LEVEL_STYLES: Record<HealthLevel, string> = {
  excellent: "bg-health-positive text-health-positive-foreground",
  good: "bg-health-positive text-health-positive-foreground",
  attention: "bg-health-attention text-health-attention-foreground",
  critical: "bg-health-critical text-health-critical-foreground",
};

const NOT_CONFIGURED_STYLE = "bg-muted text-muted-foreground";

/** Bike-level badge — dot + classification name (Excellent/Good/Need Attention/Service Due). */
export function HealthBadge({
  percent,
  dict = getDictionary("en"),
  className,
}: {
  percent: number | null;
  dict?: Dictionary;
  className?: string;
}) {
  const level = percent != null ? classifyHealth(percent) : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
        level ? LEVEL_STYLES[level] : NOT_CONFIGURED_STYLE,
        className
      )}
    >
      {level ? dict.health[level] : dict.health.notConfigured}
    </span>
  );
}

/** Component-level badge — percentage only, no text, shown next to a ServiceIntervalBar. */
export function HealthPercentBadge({ percent, className }: { percent: number | null; className?: string }) {
  const level = percent != null ? classifyHealth(percent) : null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[7px] px-2.5 py-1 text-xs font-semibold",
        level ? LEVEL_STYLES[level] : NOT_CONFIGURED_STYLE,
        className
      )}
    >
      {level ? `${percent}%` : "—"}
    </span>
  );
}
