import { parseISO } from "date-fns";

const YEAR_WORDS = /^(ano|anos|year|years|yr|yrs)$/i;
const MONTH_WORDS = /^(m[eê]s|meses|month|months|mo|mos)$/i;

/** Extracts a duration in months from free-text warranty strings like
 * "2 years", "18 months", "2 anos". Returns null if no recognizable pattern is found. */
export function parseWarrantyMonths(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*([a-zà-ú]+)/i);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();
  if (YEAR_WORDS.test(unit)) return Math.round(value * 12);
  if (MONTH_WORDS.test(unit)) return Math.round(value);
  return null;
}

/** Computes the warranty expiry date from a purchase date and free-text warranty
 * duration. Returns null if either input is missing or the warranty text can't be parsed. */
export function warrantyExpiryDate(purchaseDate: string | null, warranty: string | null): Date | null {
  if (!purchaseDate || !warranty) return null;
  const months = parseWarrantyMonths(warranty);
  if (months == null) return null;
  const date = parseISO(purchaseDate);
  date.setMonth(date.getMonth() + months);
  return date;
}
