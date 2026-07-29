import { warrantyExpiryDate } from "@/lib/warranty";
import type { InterventionType } from "@/lib/intervention-type";

export type TimelineIntervention = {
  id: string;
  componentId: string;
  componentName: string;
  type: InterventionType;
  date: string;
  description: string | null;
  kms: number | null;
  hoursUsed: number | null;
};

export type TimelineEvent =
  | ({ kind: "intervention"; sortDate: string } & TimelineIntervention)
  | { kind: "manufactured"; sortDate: string; year: number; brand: string | null }
  | { kind: "purchased"; sortDate: string; date: string }
  | { kind: "added"; sortDate: string; date: string }
  | { kind: "warrantyExpired"; sortDate: string; date: string };

/** Builds the unified, most-recent-first list of lifecycle events for a bike's
 * timeline: logged interventions across all of its components, plus derived
 * milestones (manufactured, purchased, added to Bikit, warranty expired). Each
 * milestone is only included when its source data is available. */
export function buildBikeTimeline(input: {
  bike: {
    brand: string | null;
    year: number | null;
    purchase_date: string | null;
    warranty: string | null;
    created_at: string;
  };
  interventions: TimelineIntervention[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = input.interventions.map((iv) => ({
    kind: "intervention" as const,
    sortDate: iv.date,
    ...iv,
  }));

  if (input.bike.purchase_date) {
    events.push({ kind: "purchased", sortDate: input.bike.purchase_date, date: input.bike.purchase_date });
  }

  const addedDate = input.bike.created_at.slice(0, 10);
  events.push({ kind: "added", sortDate: addedDate, date: addedDate });

  if (input.bike.year) {
    events.push({
      kind: "manufactured",
      sortDate: `${input.bike.year}-01-01`,
      year: input.bike.year,
      brand: input.bike.brand,
    });
  }

  const expiry = warrantyExpiryDate(input.bike.purchase_date, input.bike.warranty);
  if (expiry) {
    const expiryDate = expiry.toISOString().slice(0, 10);
    events.push({ kind: "warrantyExpired", sortDate: expiryDate, date: expiryDate });
  }

  return events.sort((a, b) => (a.sortDate < b.sortDate ? 1 : a.sortDate > b.sortDate ? -1 : 0));
}
