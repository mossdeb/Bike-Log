import { format, parseISO } from "date-fns";

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy");
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

const KM_TO_MI = 0.621371;

/** Distances are always stored in km; this is display-only conversion. */
export function formatDistance(km: number, unit: "km" | "mi"): string {
  return `${formatNumber(Math.round(kmToUnit(km, unit)))} ${unit}`;
}

/** Converts a stored km value to the given display unit (unformatted, for form inputs). */
export function kmToUnit(km: number, unit: "km" | "mi"): number {
  return unit === "mi" ? km * KM_TO_MI : km;
}

/** Converts a value entered in the given unit back to km for storage. */
export function unitToKm(value: number, unit: "km" | "mi"): number {
  return unit === "mi" ? value / KM_TO_MI : value;
}
