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
  const width = Math.min(Math.max(fraction, 0), 1) * 100;

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", FILL_STYLES[level])} style={{ width: `${width}%` }} />
    </div>
  );
}
