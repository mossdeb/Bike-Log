"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IntervalType } from "@/lib/validations/component.schema";

const PLACEHOLDER: Record<IntervalType, string> = { km: "800", hours: "50", months: "6" };

// Exactly one criterion drives a component's due-date calculation — this
// select+number pair submits as `interval_type` + `interval_value`, with
// the placeholder hinting at typical values for whichever type is picked.
// Takes plain resolved strings rather than the dict object — dict entries
// are functions, which can't cross the server/client boundary.
export function IntervalField({
  defaultType = "months",
  defaultValue,
  label,
  hint,
  kmLabel,
  hoursLabel,
  monthsLabel,
}: {
  defaultType?: IntervalType;
  defaultValue?: number | null;
  label: string;
  hint: string;
  kmLabel: string;
  hoursLabel: string;
  monthsLabel: string;
}) {
  const [type, setType] = useState<IntervalType>(defaultType);

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="interval_value">{label}</Label>
      <div className="flex gap-2">
        <select
          id="interval_type"
          name="interval_type"
          value={type}
          onChange={(e) => setType(e.target.value as IntervalType)}
          className="flex h-[48px] items-center rounded-sm border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="km">{kmLabel}</option>
          <option value="hours">{hoursLabel}</option>
          <option value="months">{monthsLabel}</option>
        </select>
        <Input
          id="interval_value"
          name="interval_value"
          type="number"
          step={type === "months" ? "1" : "0.1"}
          placeholder={PLACEHOLDER[type]}
          defaultValue={defaultValue ?? ""}
          className="max-w-[140px]"
        />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
