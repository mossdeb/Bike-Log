import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { formatWarranty, parseWarrantyMonths, warrantyExpiryDate, warrantyYears } from "./warranty";

const years = (n: number) => `${n} ${n === 1 ? "ano" : "anos"}`;

describe("parseWarrantyMonths", () => {
  it("reads a bare number as years — the shape the numeric field stores", () => {
    expect(parseWarrantyMonths("2")).toBe(24);
    expect(parseWarrantyMonths("0.5")).toBe(6);
    expect(parseWarrantyMonths("1,5")).toBe(18);
  });

  it("still reads the free text written before the field was numeric", () => {
    expect(parseWarrantyMonths("2 anos")).toBe(24);
    expect(parseWarrantyMonths("18 meses")).toBe(18);
    expect(parseWarrantyMonths("2 years")).toBe(24);
  });

  it("returns null when there is no duration to read", () => {
    expect(parseWarrantyMonths("vitalícia")).toBeNull();
    expect(parseWarrantyMonths("")).toBeNull();
  });
});

describe("warrantyYears", () => {
  it("converts either stored shape back to years for the input", () => {
    expect(warrantyYears("2")).toBe(2);
    expect(warrantyYears("18 meses")).toBe(1.5);
    expect(warrantyYears(null)).toBeNull();
    expect(warrantyYears("vitalícia")).toBeNull();
  });
});

describe("formatWarranty", () => {
  it("renders a duration, and falls back to the raw text otherwise", () => {
    expect(formatWarranty("2", years)).toBe("2 anos");
    expect(formatWarranty("1", years)).toBe("1 ano");
    expect(formatWarranty("18 meses", years)).toBe("1.5 anos");
    expect(formatWarranty("vitalícia", years)).toBe("vitalícia");
    expect(formatWarranty(null, years)).toBeNull();
  });
});

describe("warrantyExpiryDate", () => {
  it("adds the duration to the purchase date", () => {
    const expiry = (purchase: string, warranty: string) => {
      const date = warrantyExpiryDate(purchase, warranty);
      return date && format(date, "yyyy-MM-dd");
    };
    expect(expiry("2024-01-15", "2")).toBe("2026-01-15");
    expect(expiry("2024-01-15", "18 meses")).toBe("2025-07-15");
  });

  it("returns null when either half is missing or unreadable", () => {
    expect(warrantyExpiryDate(null, "2")).toBeNull();
    expect(warrantyExpiryDate("2024-01-15", null)).toBeNull();
    expect(warrantyExpiryDate("2024-01-15", "vitalícia")).toBeNull();
  });
});
