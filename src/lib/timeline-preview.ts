import { format } from "date-fns";
import type { TimelineEvent } from "@/lib/timeline";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/** Dates are relative to today rather than fixed, so the sample never ages
 * into looking like a stale screenshot. */
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return format(d, "yyyy-MM-dd");
}

/**
 * A stand-in timeline for readers whose plan doesn't include the real one:
 * enough events to show the shape of it — a service, a replacement, the
 * lifecycle milestones — without pretending to be their bike.
 *
 * The categories are the canonical English values on purpose; they're what
 * COMPONENT_CATEGORY_ICON is keyed off, and the card translates them for
 * display like it does everywhere else.
 */
export function previewTimelineEvents(dict: Dictionary): TimelineEvent[] {
  const preview = dict.bikes.detail.timelinePreview;
  const purchased = daysAgo(703);

  return [
    {
      kind: "intervention",
      sortDate: daysAgo(110),
      id: "preview-1",
      componentId: "preview-brake-pads",
      componentName: preview.brakePadsName,
      componentCategory: "Brake Pads",
      type: "replacement",
      date: daysAgo(110),
      description: preview.brakePadsWork,
      kms: 420.5,
      hoursUsed: 280,
    },
    { kind: "warrantyExpired", sortDate: daysAgo(150), date: daysAgo(150) },
    {
      kind: "intervention",
      sortDate: daysAgo(460),
      id: "preview-2",
      componentId: "preview-fork",
      componentName: preview.forkName,
      componentCategory: "Front Suspension (Fork)",
      type: "service",
      date: daysAgo(460),
      description: preview.forkWork,
      kms: 24.8,
      hoursUsed: 30,
    },
    { kind: "added", sortDate: daysAgo(700), date: daysAgo(700) },
    { kind: "purchased", sortDate: purchased, date: purchased },
    {
      kind: "manufactured",
      sortDate: `${purchased.slice(0, 4)}-01-01`,
      year: Number(purchased.slice(0, 4)),
      brand: preview.brand,
    },
  ];
}
