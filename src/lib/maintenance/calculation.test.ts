import { describe, expect, it } from "vitest";
import {
  calculateComponentStatus,
  rebaseBaselineOverAbsence,
  type ComponentStatusInput,
} from "./calculation";

const TODAY = new Date("2026-07-22T00:00:00");

const BASE: ComponentStatusInput = {
  intervalType: null,
  intervalValue: null,
  installDate: null,
  lastInterventionDate: null,
  componentCreatedAt: null,
  currentKm: null,
  currentHours: null,
  bikeKmAtInstall: null,
  bikeHoursAtInstall: null,
  bikeKmAtLastService: null,
  bikeHoursAtLastService: null,
};

describe("calculateComponentStatus — months", () => {
  it("is not_configured when no interval is set", () => {
    const result = calculateComponentStatus(
      { ...BASE, intervalType: null, installDate: "2026-01-01" },
      TODAY
    );
    expect(result.status).toBe("not_configured");
    expect(result.nextDueDate).toBeNull();
  });

  it("is not_configured when there's no install date, intervention, or creation date to base it on", () => {
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 6 },
      TODAY
    );
    expect(result.status).toBe("not_configured");
  });

  it("falls back to componentCreatedAt when there's no install date or intervention", () => {
    // created 2026-01-05, every 4mo -> due 2026-05-05, well overdue
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 4, componentCreatedAt: "2026-01-05" },
      TODAY
    );
    expect(result.status).toBe("overdue");
    expect(result.nextDueDate).toBe("2026-05-05");
  });

  it("prefers install_date over componentCreatedAt when both are present", () => {
    const result = calculateComponentStatus(
      {
        ...BASE,
        intervalType: "months",
        intervalValue: 6,
        installDate: "2026-06-01",
        componentCreatedAt: "2020-01-01",
      },
      TODAY
    );
    expect(result.nextDueDate).toBe("2026-12-01");
  });

  it("is ok when comfortably before the due date", () => {
    // last serviced 2026-06-01, every 6mo -> due 2026-12-01, ~132 days out
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 6, installDate: "2023-01-01", lastInterventionDate: "2026-06-01" },
      TODAY
    );
    expect(result.status).toBe("ok");
    expect(result.nextDueDate).toBe("2026-12-01");
  });

  it("is due_soon within the 14-day window", () => {
    // due 2026-07-27 (5 days from TODAY)
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 8, installDate: "2024-01-05", lastInterventionDate: "2025-11-27" },
      TODAY
    );
    expect(result.status).toBe("due_soon");
    expect(result.daysRemaining).toBe(5);
  });

  it("is due_soon at the exact 14-day boundary", () => {
    // due 2026-08-05, exactly 14 days from TODAY
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 1, installDate: null, lastInterventionDate: "2026-07-05" },
      TODAY
    );
    expect(result.daysRemaining).toBe(14);
    expect(result.status).toBe("due_soon");
  });

  it("is ok just past the 14-day boundary (15 days out)", () => {
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 1, installDate: null, lastInterventionDate: "2026-07-06" },
      TODAY
    );
    expect(result.daysRemaining).toBe(15);
    expect(result.status).toBe("ok");
  });

  it("is overdue once the due date has passed", () => {
    // due 2026-07-10, 12 days ago
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 6, installDate: "2023-04-10", lastInterventionDate: "2026-01-10" },
      TODAY
    );
    expect(result.status).toBe("overdue");
    expect(result.daysRemaining).toBe(-12);
  });

  it("is overdue on the exact due date (0 days remaining)", () => {
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 1, installDate: null, lastInterventionDate: "2026-06-22" },
      TODAY
    );
    expect(result.daysRemaining).toBe(0);
    expect(result.status).toBe("overdue");
  });

  it("falls back to install_date when no intervention has been logged yet", () => {
    // no interventions yet; installed 2026-01-05, every 4mo -> due 2026-05-05, well overdue
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 4, installDate: "2026-01-05", lastInterventionDate: null },
      TODAY
    );
    expect(result.status).toBe("overdue");
    expect(result.nextDueDate).toBe("2026-05-05");
  });

  it("prefers the last intervention date over install_date when both exist", () => {
    const result = calculateComponentStatus(
      { ...BASE, intervalType: "months", intervalValue: 12, installDate: "2020-01-01", lastInterventionDate: "2026-06-15" },
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
      { ...BASE, intervalType: "months", intervalValue: 1, installDate: null, lastInterventionDate: "2026-01-31" },
      TODAY
    );
    expect(result.nextDueDate).toBe("2026-03-03");
  });
});

describe("calculateComponentStatus — km", () => {
  it("is not_configured without a bike total or an install baseline", () => {
    const result = calculateComponentStatus({ ...BASE, intervalType: "km", intervalValue: 800 });
    expect(result.status).toBe("not_configured");
  });

  it("is ok comfortably under the threshold", () => {
    // installed at 100km, bike now at 300km -> 200km used, 600km to go
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "km",
      intervalValue: 800,
      currentKm: 300,
      bikeKmAtInstall: 100,
    });
    expect(result.status).toBe("ok");
    expect(result.amountRemaining).toBe(600);
  });

  it("is due_soon within the last 10% of the interval", () => {
    // 800km interval -> due_soon at <=80km remaining
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "km",
      intervalValue: 800,
      currentKm: 730,
      bikeKmAtInstall: 0,
    });
    expect(result.amountRemaining).toBe(70);
    expect(result.status).toBe("due_soon");
  });

  it("is overdue once usage meets or exceeds the interval", () => {
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "km",
      intervalValue: 800,
      currentKm: 950,
      bikeKmAtInstall: 100,
    });
    expect(result.amountRemaining).toBe(-50);
    expect(result.status).toBe("overdue");
  });

  it("resets against the last service, not install, once serviced", () => {
    // installed at 0km, serviced at 800km, bike now at 900km -> only 100km since service
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "km",
      intervalValue: 800,
      currentKm: 900,
      bikeKmAtInstall: 0,
      bikeKmAtLastService: 800,
    });
    expect(result.amountRemaining).toBe(700);
    expect(result.status).toBe("ok");
  });
});

describe("calculateComponentStatus — hours", () => {
  it("is overdue once usage meets or exceeds the interval", () => {
    // suspension serviced every 50h, currently at 65h since install
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "hours",
      intervalValue: 50,
      currentHours: 65,
      bikeHoursAtInstall: 0,
    });
    expect(result.amountRemaining).toBe(-15);
    expect(result.status).toBe("overdue");
  });

  it("is ok when far from the threshold", () => {
    const result = calculateComponentStatus({
      ...BASE,
      intervalType: "hours",
      intervalValue: 50,
      currentHours: 20,
      bikeHoursAtInstall: 10,
    });
    expect(result.amountRemaining).toBe(40);
    expect(result.status).toBe("ok");
  });
});

describe("rebaseBaselineOverAbsence", () => {
  it("adds back exactly what the bike rode without the part", () => {
    // Fitted at 3000, archived with the bike on 3300 (so it had done 300).
    // The bike reaches 3500 while it sits out. Put back, it must still read
    // 300 — which means the baseline has to move to 3200.
    expect(rebaseBaselineOverAbsence(3000, 3300, 3500)).toBe(3200);
    expect(3500 - 3200).toBe(300);
  });

  it("leaves the baseline alone when the bike didn't move", () => {
    expect(rebaseBaselineOverAbsence(3000, 3300, 3300)).toBe(3000);
  });

  it("ignores a bike total corrected downwards", () => {
    // Following it would drag the baseline back and credit the part with
    // usage it never had.
    expect(rebaseBaselineOverAbsence(3000, 3300, 3100)).toBe(3000);
  });

  it("leaves the baseline alone when anything is unknown", () => {
    expect(rebaseBaselineOverAbsence(3000, null, 3500)).toBe(3000);
    expect(rebaseBaselineOverAbsence(3000, 3300, null)).toBe(3000);
    expect(rebaseBaselineOverAbsence(null, 3300, 3500)).toBe(null);
  });

  it("handles the negative baseline a rounded-down initial usage can leave", () => {
    expect(rebaseBaselineOverAbsence(-0.02, 329.6, 429.6)).toBeCloseTo(99.98, 5);
  });
});
