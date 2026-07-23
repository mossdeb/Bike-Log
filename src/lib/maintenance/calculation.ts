export type ServiceStatus = "ok" | "due_soon" | "overdue" | "not_configured";

export interface ComponentStatusInput {
  intervalMonths: number | null;
  installDate: string | null; // "YYYY-MM-DD"
  lastInterventionDate: string | null; // "YYYY-MM-DD", most recent logged intervention
}

export interface ComponentStatusResult {
  status: ServiceStatus;
  nextDueDate: string | null; // "YYYY-MM-DD"
  daysRemaining: number | null; // negative once overdue
}

const DUE_SOON_THRESHOLD_DAYS = 14;

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

/**
 * Date-based "next service due" calculation (V1). Km/hours are recorded on
 * every intervention but don't drive status yet — see the plan's Phase 3
 * note on why, and how this can extend later without a schema change.
 */
export function calculateComponentStatus(
  input: ComponentStatusInput,
  today: Date = new Date()
): ComponentStatusResult {
  if (!input.intervalMonths) {
    return { status: "not_configured", nextDueDate: null, daysRemaining: null };
  }

  const baseDateStr = input.lastInterventionDate ?? input.installDate;
  if (!baseDateStr) {
    return { status: "not_configured", nextDueDate: null, daysRemaining: null };
  }

  const nextDue = parseDateOnly(baseDateStr);
  nextDue.setMonth(nextDue.getMonth() + input.intervalMonths);

  const daysRemaining = daysBetween(today, nextDue);
  const status: ServiceStatus =
    daysRemaining <= 0 ? "overdue" : daysRemaining <= DUE_SOON_THRESHOLD_DAYS ? "due_soon" : "ok";

  return { status, nextDueDate: toDateOnlyString(nextDue), daysRemaining };
}

const STATUS_RANK: Record<ServiceStatus, number> = {
  overdue: 0,
  due_soon: 1,
  ok: 2,
  not_configured: 3,
};

/** The most urgent status among a bike's components — used to badge the bike itself. */
export function worstStatus(statuses: ServiceStatus[]): ServiceStatus {
  return statuses.reduce(
    (worst, s) => (STATUS_RANK[s] < STATUS_RANK[worst] ? s : worst),
    "not_configured" as ServiceStatus
  );
}
