import { classifyHealth, healthPercent, type HealthLevel } from "@/lib/maintenance/health";
import { cn } from "@/lib/utils";

const FILL_STYLES: Record<HealthLevel, string> = {
  excellent: "bg-health-positive",
  good: "bg-health-positive",
  attention: "bg-health-attention",
  critical: "bg-health-critical",
};

export function ServiceIntervalBar({ fraction, className }: { fraction: number | null; className?: string }) {
  if (fraction == null) return null;
  const percent = healthPercent(fraction)!;
  const level = classifyHealth(percent);
  // The bar shows health remaining, not usage consumed — full and green
  // at the start of the interval, draining as it's used up. Once fully
  // consumed (0%), draining to nothing would make the critical state
  // invisible, so it's shown fully filled in the critical color instead.
  const width = percent === 0 ? 100 : percent;

  return (
    <div className={cn("h-[3px] w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", FILL_STYLES[level])} style={{ width: `${width}%` }} />
    </div>
  );
}
