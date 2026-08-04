import { parseISO } from "date-fns";

const YEAR_WORDS = /^(ano|anos|year|years|yr|yrs)$/i;
const MONTH_WORDS = /^(m[eê]s|meses|month|months|mo|mos)$/i;

/** Extracts a duration in months from a stored warranty value.
 *
 * The field is a number of years now, stored as a bare number in the (still
 * text) column — "2" means two years. Rows written before that was a numeric
 * field hold free text like "2 anos" or "18 months", so both shapes parse. */
export function parseWarrantyMonths(text: string): number | null {
  const trimmed = text.trim();

  const bareYears = /^\d+(?:[.,]\d+)?$/.exec(trimmed);
  if (bareYears) return Math.round(parseFloat(trimmed.replace(",", ".")) * 12);

  const match = trimmed.match(/(\d+(?:[.,]\d+)?)\s*([a-zà-ú]+)/i);
  if (!match) return null;
  const value = parseFloat(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();
  if (YEAR_WORDS.test(unit)) return Math.round(value * 12);
  if (MONTH_WORDS.test(unit)) return Math.round(value);
  return null;
}

/** The stored value as a number of years, for the numeric input to prefill —
 * null when a legacy value can't be read as a duration at all. */
export function warrantyYears(value: string | null | undefined): number | null {
  if (!value) return null;
  const months = parseWarrantyMonths(value);
  if (months == null) return null;
  return Math.round((months / 12) * 100) / 100;
}

/** Renders a stored value for display ("2" → "2 anos"), falling back to the
 * raw text for legacy values that aren't a duration. */
export function formatWarranty(
  value: string | null | undefined,
  formatYears: (years: number) => string
): string | null {
  if (!value) return null;
  const years = warrantyYears(value);
  return years == null ? value : formatYears(years);
}

/** Computes the warranty expiry date from a purchase date and a warranty
 * duration. Returns null if either input is missing or the warranty can't be parsed. */
export function warrantyExpiryDate(purchaseDate: string | null, warranty: string | null): Date | null {
  if (!purchaseDate || !warranty) return null;
  const months = parseWarrantyMonths(warranty);
  if (months == null) return null;
  const date = parseISO(purchaseDate);
  date.setMonth(date.getMonth() + months);
  return date;
}
