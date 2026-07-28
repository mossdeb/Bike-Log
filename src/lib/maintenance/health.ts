export type HealthLevel = "excellent" | "good" | "attention" | "critical";

/**
 * A component's health is the inverse of how much of its service interval
 * has been consumed — 100% right after install/service, 0% once overdue.
 * Clamped to [0, 100] since fractionUsed can exceed 1 once overdue.
 */
export function healthPercent(fractionUsed: number | null): number | null {
  if (fractionUsed == null) return null;
  return Math.round(Math.min(Math.max(1 - fractionUsed, 0), 1) * 100);
}

export function classifyHealth(percent: number): HealthLevel {
  if (percent >= 85) return "excellent";
  if (percent >= 25) return "good";
  if (percent >= 5) return "attention";
  return "critical";
}

/** Bike Health — the average health percent across a bike's installed components. */
export function averageHealth(percents: (number | null)[]): number | null {
  const valid = percents.filter((p): p is number => p != null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, p) => sum + p, 0) / valid.length);
}
