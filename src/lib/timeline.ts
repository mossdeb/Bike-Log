import { format } from "date-fns";
import { warrantyExpiryDate } from "@/lib/warranty";
import type { InterventionType } from "@/lib/intervention-type";

export type TimelineIntervention = {
  id: string;
  componentId: string;
  componentName: string;
  componentCategory: string | null;
  type: InterventionType;
  date: string;
  description: string | null;
  kms: number | null;
  hoursUsed: number | null;
};

export type TimelineComponentInstall = {
  id: string;
  name: string;
  category: string | null;
  installDate: string;
  initialKm: number | null;
  initialHours: number | null;
};

export type TimelineComponentArchived = {
  id: string;
  name: string;
  category: string | null;
  retiredAt: string;
  /** Usage the part finished on, frozen at the moment it came off the bike. */
  km: number | null;
  hours: number | null;
};

export type TimelineEvent =
  | ({ kind: "intervention"; sortDate: string } & TimelineIntervention)
  | ({ kind: "componentInstalled"; sortDate: string } & TimelineComponentInstall)
  | ({ kind: "componentArchived"; sortDate: string } & TimelineComponentArchived)
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
  components?: TimelineComponentInstall[];
  archived?: TimelineComponentArchived[];
}): TimelineEvent[] {
  const events: TimelineEvent[] = input.interventions.map((iv) => ({
    kind: "intervention" as const,
    sortDate: iv.date,
    ...iv,
  }));

  // A part fitted at the same time as the bike doesn't get its own entry: it
  // would stack a card per original component on top of "Purchased", each one
  // repeating the same date to say nothing the bike's own entry doesn't.
  //
  // The test is the install date alone. Both ways of answering "it came with
  // the bike" land here — one writes the bike's purchase date, the other
  // leaves the date empty — and an undated component is one whose fitting date
  // simply isn't known, which is no basis for putting it on a timeline.
  for (const component of input.components ?? []) {
    if (!component.installDate) continue;
    if (component.installDate === input.bike.purchase_date) continue;
    events.push({ kind: "componentInstalled", sortDate: component.installDate, ...component });
  }

  // Archiving always has a date — it is stamped at the moment it happens, not
  // asked for — so there is no install-date style exclusion to make here. A
  // part that came off the bike is a closing bracket on the install above it.
  for (const component of input.archived ?? []) {
    events.push({ kind: "componentArchived", sortDate: component.retiredAt, ...component });
  }

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
    // Local date parts, not toISOString(): the expiry is a local midnight, and
    // UTC would shift it a day back for anyone ahead of UTC.
    const expiryDate = format(expiry, "yyyy-MM-dd");
    events.push({ kind: "warrantyExpired", sortDate: expiryDate, date: expiryDate });
  }

  return events.sort((a, b) => (a.sortDate < b.sortDate ? 1 : a.sortDate > b.sortDate ? -1 : 0));
}
