"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstallDateField } from "@/components/install-date-field";

/**
 * The number inputs are `step="0.1"`; a raw Strava total like 3302.9434 would
 * fail the browser's step check and silently block the submit.
 *
 * Rounds down, not to nearest: the server derives the baseline as
 * `bike total − this`, so rounding 2.4811 up to 2.5 leaves it at −0.019 and the
 * part reads as having covered more than the bike it is fitted to. Down keeps
 * the baseline at or above zero at the cost of at most 99 metres.
 */
function toStep(value: number | null | undefined) {
  return String(Math.floor((value ?? 0) * 10) / 10);
}

/**
 * The install date and the usage the part already carries, as one question.
 *
 * They stopped being independent once the date offered "came with the bike":
 * a part fitted today has done nothing, and a part that came with the bike has
 * done everything the bike has. The server folds this into the baseline as
 * `bike_km_at_install = bike total − initial_km`, so those two answers land on
 * the bike's current total and zero respectively — which is what they mean.
 *
 * Only the answers that imply a figure write one. "Custom" and "Not set" leave
 * the numbers alone, because a date somewhere in the middle says nothing about
 * how far the part has come.
 *
 * A bike with no purchase date can't offer that answer as a date, but it can
 * still offer it as a fact: "came with the bike" fills the same totals and
 * leaves the date empty, which the install date already allowed. The baseline
 * — what drives the component's health — comes out identical either way.
 *
 * `bikeTotalKm` arrives already in the reader's unit — the same unit the field
 * is labelled with and the server converts back from.
 */
export function ComponentInstallFields({
  dateLabel,
  todayLabel,
  bikeLabel,
  customLabel,
  notSetLabel,
  withBikeLabel,
  kmLabel,
  hoursLabel,
  usageHint,
  bikePurchaseDate,
  bikeTotalKm,
  bikeTotalHours,
}: {
  dateLabel: string;
  todayLabel: string;
  bikeLabel: string;
  customLabel: string;
  notSetLabel: string;
  withBikeLabel: string;
  kmLabel: string;
  hoursLabel: string;
  usageHint: string;
  bikePurchaseDate?: string | null;
  bikeTotalKm?: number | null;
  bikeTotalHours?: number | null;
}) {
  // Starts at zero to match the initial "Today" — a brand-new part hasn't
  // accrued any wear yet.
  const [km, setKm] = useState("0");
  const [hours, setHours] = useState("0");

  return (
    <>
      <InstallDateField
        label={dateLabel}
        todayLabel={todayLabel}
        bikeLabel={bikeLabel}
        customLabel={customLabel}
        notSetLabel={notSetLabel}
        withBikeLabel={withBikeLabel}
        bikePurchaseDate={bikePurchaseDate}
        onModeChange={(mode) => {
          if (mode === "today") {
            setKm("0");
            setHours("0");
          } else if (mode === "bike" || mode === "with-bike") {
            setKm(toStep(bikeTotalKm));
            setHours(toStep(bikeTotalHours));
          }
        }}
      />

      <div className="space-y-1.5 sm:col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="initial_km">{kmLabel}</Label>
            <Input
              id="initial_km"
              name="initial_km"
              type="number"
              step="0.1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="initial_hours">{hoursLabel}</Label>
            <Input
              id="initial_hours"
              name="initial_hours"
              type="number"
              step="0.1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{usageHint}</p>
      </div>
    </>
  );
}
