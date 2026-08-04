import { describe, it, expect } from "vitest";
import { formatHours, formatDistance } from "./format";

describe("formatHours", () => {
  it("rounds away Strava's fractional hours instead of printing them", () => {
    // The regression this exists for: 327.4137 used to render as "327.414 h",
    // which reads as three hundred thousand hours.
    expect(formatHours(327.4137, "pt")).toBe("327 h");
    expect(formatHours(327.4137, "en")).toBe("327 h");
  });

  it("keeps one decimal below ten, where the fraction is the whole story", () => {
    expect(formatHours(0.44, "en")).toBe("0.4 h");
    expect(formatHours(0.44, "pt")).toBe("0,4 h");
    expect(formatHours(9.87, "en")).toBe("9.9 h");
  });

  it("groups thousands the way the reader's language does", () => {
    expect(formatHours(32888, "en")).toBe("32,888 h");
    expect(formatHours(32888, "pt")).not.toContain(",");
  });
});

describe("formatDistance", () => {
  it("converts to miles and rounds", () => {
    expect(formatDistance(100, "mi", "en")).toBe("62 mi");
    expect(formatDistance(100, "km", "en")).toBe("100 km");
  });

  it("does not put an English thousands comma in front of a Portuguese reader", () => {
    expect(formatDistance(3288, "km", "en")).toBe("3,288 km");
    expect(formatDistance(3288, "km", "pt")).toBe("3288 km");
  });
});
