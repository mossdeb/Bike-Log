import { describe, expect, it } from "vitest";
import { calculateComponentStatus } from "./calculation";

const TODAY = new Date("2026-07-22T00:00:00");

describe("calculateComponentStatus", () => {
  it("is not_configured when no interval is set", () => {
    const result = calculateComponentStatus(
      { intervalMonths: null, installDate: "2026-01-01", lastInterventionDate: null },
      TODAY
    );
    expect(result.status).toBe("not_configured");
    expect(result.nextDueDate).toBeNull();
  });

  it("is not_configured when there's no install date or intervention to base it on", () => {
    const result = calculateComponentStatus(
      { intervalMonths: 6, installDate: null, lastInterventionDate: null },
      TODAY
    );
    expect(result.status).toBe("not_configured");
  });

  it("is ok when comfortably before the due date", () => {
    // last serviced 2026-06-01, every 6mo -> due 2026-12-01, ~132 days out
    const result = calculateComponentStatus(
      { intervalMonths: 6, installDate: "2023-01-01", lastInterventionDate: "2026-06-01" },
      TODAY
    );
    expect(result.status).toBe("ok");
    expect(result.nextDueDate).toBe("2026-12-01");
  });

  it("is due_soon within the 14-day window", () => {
    // due 2026-07-27 (5 days from TODAY)
    const result = calculateComponentStatus(
      { intervalMonths: 8, installDate: "2024-01-05", lastInterventionDate: "2025-11-27" },
      TODAY
    );
    expect(result.status).toBe("due_soon");
    expect(result.daysRemaining).toBe(5);
  });

  it("is due_soon at the exact 14-day boundary", () => {
    // due 2026-08-05, exactly 14 days from TODAY
    const result = calculateComponentStatus(
      { intervalMonths: 1, installDate: null, lastInterventionDate: "2026-07-05" },
      TODAY
    );
    expect(result.daysRemaining).toBe(14);
    expect(result.status).toBe("due_soon");
  });

  it("is ok just past the 14-day boundary (15 days out)", () => {
    const result = calculateComponentStatus(
      { intervalMonths: 1, installDate: null, lastInterventionDate: "2026-07-06" },
      TODAY
    );
    expect(result.daysRemaining).toBe(15);
    expect(result.status).toBe("ok");
  });

  it("is overdue once the due date has passed", () => {
    // due 2026-07-10, 12 days ago
    const result = calculateComponentStatus(
      { intervalMonths: 6, installDate: "2023-04-10", lastInterventionDate: "2026-01-10" },
      TODAY
    );
    expect(result.status).toBe("overdue");
    expect(result.daysRemaining).toBe(-12);
  });

  it("is overdue on the exact due date (0 days remaining)", () => {
    const result = calculateComponentStatus(
      { intervalMonths: 1, installDate: null, lastInterventionDate: "2026-06-22" },
      TODAY
    );
    expect(result.daysRemaining).toBe(0);
    expect(result.status).toBe("overdue");
  });

  it("falls back to install_date when no intervention has been logged yet", () => {
    // no interventions yet; installed 2026-01-05, every 4mo -> due 2026-05-05, well overdue
    const result = calculateComponentStatus(
      { intervalMonths: 4, installDate: "2026-01-05", lastInterventionDate: null },
      TODAY
    );
    expect(result.status).toBe("overdue");
    expect(result.nextDueDate).toBe("2026-05-05");
  });

  it("prefers the last intervention date over install_date when both exist", () => {
    const result = calculateComponentStatus(
      { intervalMonths: 12, installDate: "2020-01-01", lastInterventionDate: "2026-06-15" },
      TODAY
    );
    expect(result.nextDueDate).toBe("2027-06-15");
    expect(result.status).toBe("ok");
  });

  it("handles month-end overflow correctly (e.g. Jan 31 + 1 month)", () => {
    // JS Date setMonth on day-31 bases can overflow into the month after
    // next (e.g. Jan 31 + 1mo -> Mar 3, not Feb 28) — pin the behavior so a
    // future refactor can't silently change it unnoticed.
    const result = calculateComponentStatus(
      { intervalMonths: 1, installDate: null, lastInterventionDate: "2026-01-31" },
      TODAY
    );
    expect(result.nextDueDate).toBe("2026-03-03");
  });
});
