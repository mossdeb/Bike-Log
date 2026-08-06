export type ServiceStatus = "ok" | "due_soon" | "overdue" | "not_configured";
export type IntervalType = "km" | "hours" | "months";

export interface ComponentStatusInput {
  intervalType: IntervalType | null;
  intervalValue: number | null;
  installDate: string | null; // "YYYY-MM-DD"
  lastInterventionDate: string | null; // "YYYY-MM-DD", most recent logged intervention

  // Last-resort base date for months criteria, when there's neither a
  // logged intervention nor an explicit install date — the component's
  // own creation date. Install date is an optional field the owner may
  // never touch, so without this fallback a months reminder could stay
  // stuck "not configured" indefinitely.
  componentCreatedAt: string | null; // "YYYY-MM-DD"

  // Only needed for km/hours criteria — the bike's current totals and what
  // they were at this component's install and (if serviced since) its last
  // service, so usage accrued since then can be measured.
  currentKm: number | null;
  currentHours: number | null;
  bikeKmAtInstall: number | null;
  bikeHoursAtInstall: number | null;
  bikeKmAtLastService: number | null;
  bikeHoursAtLastService: number | null;
}

export interface ComponentStatusResult {
  status: ServiceStatus;
  nextDueDate: string | null; // "YYYY-MM-DD" — months criteria only
  daysRemaining: number | null; // negative once overdue — months criteria only
  amountRemaining: number | null; // negative once overdue — km/hours criteria only
  fractionUsed: number | null; // 0–1+ of the interval consumed, any criteria — for progress bars
}

const DUE_SOON_THRESHOLD_DAYS = 14;
const DUE_SOON_THRESHOLD_FRACTION = 0.1; // last 10% of the km/hours interval counts as "due soon"

const NOT_CONFIGURED: ComponentStatusResult = {
  status: "not_configured",
  nextDueDate: null,
  daysRemaining: null,
  amountRemaining: null,
  fractionUsed: null,
};

function parseDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysBetween(a: Date, b: Date): number {
  const aMid = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bMid = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bMid.getTime() - aMid.getTime()) / 86_400_000);
}

function calculateMonthsStatus(input: ComponentStatusInput, today: Date): ComponentStatusResult {
  const baseDateStr = input.lastInterventionDate ?? input.installDate ?? input.componentCreatedAt;
  if (!baseDateStr || !input.intervalValue) return NOT_CONFIGURED;

  const baseDate = parseDateOnly(baseDateStr);
  const nextDue = parseDateOnly(baseDateStr);
  nextDue.setMonth(nextDue.getMonth() + input.intervalValue);

  const daysRemaining = daysBetween(today, nextDue);
  const status: ServiceStatus =
    daysRemaining <= 0 ? "overdue" : daysRemaining <= DUE_SOON_THRESHOLD_DAYS ? "due_soon" : "ok";

  const totalIntervalDays = daysBetween(baseDate, nextDue);
  const fractionUsed = totalIntervalDays > 0 ? (totalIntervalDays - daysRemaining) / totalIntervalDays : null;

  return { status, nextDueDate: toDateOnlyString(nextDue), daysRemaining, amountRemaining: null, fractionUsed };
}

function calculateUsageStatus(
  current: number | null,
  atInstall: number | null,
  atLastService: number | null,
  intervalValue: number | null
): ComponentStatusResult {
  const reference = atLastService ?? atInstall;
  if (current == null || reference == null || !intervalValue) return NOT_CONFIGURED;

  const usedSinceService = current - reference;
  const amountRemaining = intervalValue - usedSinceService;
  const dueSoonThreshold = intervalValue * DUE_SOON_THRESHOLD_FRACTION;
  const status: ServiceStatus =
    amountRemaining <= 0 ? "overdue" : amountRemaining <= dueSoonThreshold ? "due_soon" : "ok";

  return { status, nextDueDate: null, daysRemaining: null, amountRemaining, fractionUsed: usedSinceService / intervalValue };
}

/**
 * "Next service due" calculation — driven by exactly one criterion per
 * component (km, hours, or months), chosen by the user when configuring it.
 */
export function calculateComponentStatus(
  input: ComponentStatusInput,
  today: Date = new Date()
): ComponentStatusResult {
  if (!input.intervalType) return NOT_CONFIGURED;

  switch (input.intervalType) {
    case "months":
      return calculateMonthsStatus(input, today);
    case "km":
      return calculateUsageStatus(
        input.currentKm,
        input.bikeKmAtInstall,
        input.bikeKmAtLastService,
        input.intervalValue
      );
    case "hours":
      return calculateUsageStatus(
        input.currentHours,
        input.bikeHoursAtInstall,
        input.bikeHoursAtLastService,
        input.intervalValue
      );
  }
}

export interface NamedIntervalStatusInput extends ComponentStatusInput {
  id: string; // component_service_intervals.id
  name: string;
}

export interface ActiveIntervalResult {
  interval: NamedIntervalStatusInput;
  status: ComponentStatusResult;
}

/**
 * Of a component's configured intervals, picks the one closest to
 * expiring — highest fractionUsed — as the "active" one that drives the
 * component's health badge/card. Once that interval is reset, whichever
 * interval is next-closest naturally takes over on the next call. Returns
 * null when there are no intervals, or none has a computable fractionUsed.
 */
export function selectActiveInterval(
  intervals: NamedIntervalStatusInput[],
  today: Date = new Date()
): ActiveIntervalResult | null {
  let best: ActiveIntervalResult | null = null;
  for (const interval of intervals) {
    const status = calculateComponentStatus(interval, today);
    if (status.fractionUsed == null) continue;
    if (best == null || status.fractionUsed > best.status.fractionUsed!) {
      best = { interval, status };
    }
  }
  return best;
}

export interface ComponentUsage {
  km: number | null;
  hours: number | null;
}

/**
 * A component's accumulated usage isn't stored directly — it's the bike's
 * current total minus whatever the bike's total was at the moment the
 * component was installed, so a component only accrues usage from when it
 * joined the bike, not the bike's full history.
 */
export function calculateComponentUsage(input: {
  bikeTotalKm: number | null;
  bikeTotalHours: number | null;
  bikeKmAtInstall: number | null;
  bikeHoursAtInstall: number | null;
}): ComponentUsage {
  const km =
    input.bikeTotalKm != null && input.bikeKmAtInstall != null
      ? Math.max(input.bikeTotalKm - input.bikeKmAtInstall, 0)
      : null;
  const hours =
    input.bikeTotalHours != null && input.bikeHoursAtInstall != null
      ? Math.max(input.bikeTotalHours - input.bikeHoursAtInstall, 0)
      : null;
  return { km, hours };
}

/**
 * Moves a component's baseline forward by the distance the bike covered while
 * the component was archived.
 *
 * Usage is measured against the bike's odometer, so a part put back on without
 * this correction would be handed every kilometre ridden in its absence. Adding
 * the gap to the baseline cancels it exactly, and the part resumes on the
 * reading it left. It is the same move rebaseComponentBaselines makes when a
 * bike's totals are edited, for the same reason.
 *
 * Anything unknown leaves the baseline where it is: a guess here surfaces as a
 * wrong figure on a real part, which is worse than no correction.
 *
 * A negative gap is ignored on purpose. A bike's totals can be corrected
 * downwards, and following that would drag the baseline back and credit the
 * part with usage it never had.
 */
export function rebaseBaselineOverAbsence(
  baseline: number | null | undefined,
  bikeTotalAtArchive: number | null | undefined,
  bikeTotalNow: number | null | undefined
): number | null {
  if (baseline == null || bikeTotalAtArchive == null || bikeTotalNow == null) {
    return baseline ?? null;
  }
  const riddenWithout = bikeTotalNow - bikeTotalAtArchive;
  return riddenWithout > 0 ? baseline + riddenWithout : baseline;
}
