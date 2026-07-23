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
  const value = unit === "mi" ? km * KM_TO_MI : km;
  return `${formatNumber(Math.round(value))} ${unit}`;
}
