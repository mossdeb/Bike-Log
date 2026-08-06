"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Label } from "@/components/ui/label";

export type InstallDateMode = "today" | "bike" | "with-bike" | "custom" | "none";
type Mode = InstallDateMode;

function toISODate(d: Date) {
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

const TODAY = toISODate(new Date());

/**
 * Quick-select for a component's install date, in the shape of the
 * intervention date field: the two answers that cover almost every case as
 * one tap each, and the native picker only for the rest.
 *
 * "Bike purchase date" is the shortcut for a part that came fitted to the
 * bike. It's only offered when the bike actually has a purchase date — the
 * date it was added to Bikit would always be available but means something
 * else entirely, and this field is the baseline a month-based reminder counts
 * from until the first intervention is logged.
 *
 * `allowNotSet` exists for the edit form: a component saved before this field
 * existed has no install date, and defaulting it to today would silently move
 * that baseline forward on the next unrelated save.
 */
export function InstallDateField({
  label,
  todayLabel,
  bikeLabel,
  customLabel,
  notSetLabel,
  withBikeLabel,
  bikePurchaseDate,
  defaultValue,
  allowNotSet = false,
  onModeChange,
}: {
  label: string;
  todayLabel: string;
  bikeLabel: string;
  customLabel: string;
  notSetLabel: string;
  /** Stand-in for `bikeLabel` on a bike with no purchase date: same "it came
   * with the bike" answer, but it leaves the date empty. Only rendered when a
   * caller supplies it, since it exists to drive usage fields the edit form
   * doesn't have. */
  withBikeLabel?: string;
  bikePurchaseDate?: string | null;
  defaultValue?: string | null;
  allowNotSet?: boolean;
  /** Fires only when the reader picks a different answer, never on mount —
   * so a caller that mirrors the choice into other fields doesn't overwrite
   * whatever they typed there by hand. */
  onModeChange?: (mode: Mode) => void;
}) {
  const bikeDate = bikePurchaseDate || null;

  const initialMode: Mode = !defaultValue
    ? allowNotSet
      ? "none"
      : "today"
    : defaultValue === TODAY
      ? "today"
      : bikeDate && defaultValue === bikeDate
        ? "bike"
        : "custom";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [customDate, setCustomDate] = useState(defaultValue && initialMode === "custom" ? defaultValue : TODAY);

  // "none" and "with-bike" both mean no date — the second says why.
  const value = mode === "today" ? TODAY : mode === "bike" ? (bikeDate ?? "") : mode === "custom" ? customDate : "";

  return (
    <div className="space-y-1.5 sm:col-span-2">
      <Label htmlFor="install-date-mode">{label}</Label>
      <input type="hidden" name="install_date" value={value} />
      <div className="relative">
        <select
          id="install-date-mode"
          value={mode}
          onChange={(e) => {
            const next = e.target.value as Mode;
            setMode(next);
            onModeChange?.(next);
          }}
          className="flex h-[48px] w-full appearance-none items-center rounded-sm border border-input bg-transparent pr-11 pl-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="today">{todayLabel}</option>
          {bikeDate ? (
            <option value="bike">{bikeLabel}</option>
          ) : (
            withBikeLabel && <option value="with-bike">{withBikeLabel}</option>
          )}
          <option value="custom">{customLabel}</option>
          {allowNotSet && <option value="none">{notSetLabel}</option>}
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
