import { format, parseISO } from "date-fns";

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM yyyy");
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}
