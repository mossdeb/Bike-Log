"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";

type Mode = "today" | "yesterday" | "custom";

function toISODate(d: Date) {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

const TODAY = toISODate(new Date());
const YESTERDAY = toISODate(new Date(Date.now() - 24 * 60 * 60 * 1000));

/** Quick-select for the intervention date — defaults to today, with a
 * one-tap "yesterday" shortcut and a native date picker for anything
 * else, instead of always requiring the calendar for the common cases. */
export function InterventionDateField({
  label,
  todayLabel,
  yesterdayLabel,
  customLabel,
  defaultValue,
}: {
  label: string;
  todayLabel: string;
  yesterdayLabel: string;
  customLabel: string;
  defaultValue?: string | null;
}) {
  const initialMode: Mode =
    !defaultValue || defaultValue === TODAY ? "today" : defaultValue === YESTERDAY ? "yesterday" : "custom";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [customDate, setCustomDate] = useState(defaultValue && initialMode === "custom" ? defaultValue : TODAY);

  const value = mode === "today" ? TODAY : mode === "yesterday" ? YESTERDAY : customDate;

  return (
    <div className="space-y-1.5">
      <Label htmlFor="date-mode">{label}</Label>
      <input type="hidden" name="date" value={value} />
      <div className="relative">
        <select
          id="date-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="flex h-[48px] w-full appearance-none items-center rounded-sm border border-input bg-transparent pr-11 pl-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="today">{todayLabel}</option>
          <option value="yesterday">{yesterdayLabel}</option>
          <option value="custom">{customLabel}</option>
        </select>
        {/* Keeps the calendar glyph instead of a chevron, but on the same 20px
            inset as every other dropdown. */}
        <Calendar className="pointer-events-none absolute top-1/2 right-5 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {mode === "custom" && (
        <input
          type="date"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          max={TODAY}
          className="flex h-[48px] w-full items-center rounded-sm border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        />
      )}
    </div>
  );
}
