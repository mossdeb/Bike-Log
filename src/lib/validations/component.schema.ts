import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().trim().max(max).nullable()
  );

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(min).max(max).nullable()
  );

export const INTERVAL_TYPES = ["km", "hours", "months"] as const;
export type IntervalType = (typeof INTERVAL_TYPES)[number];

const optionalIntervalType = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.enum(INTERVAL_TYPES).nullable()
);

const currentYear = new Date().getFullYear();

const optionalYear = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce.number().int().min(1900).max(currentYear + 1).nullable()
);

export const componentSchema = z.object({
  name: optionalText(120),
  category: optionalText(60),
  brand: optionalText(120),
  model: optionalText(120),
  serial_number: optionalText(120),
  install_date: optionalText(10), // "YYYY-MM-DD" from <input type="date">
  interval_type: optionalIntervalType,
  interval_value: optionalNumber(0.1, 1000000),
  notes: optionalText(2000),
  purchase_date: optionalText(10), // "YYYY-MM-DD" from <input type="date">
  warranty: optionalText(120),
  year: optionalYear,
});

export type ComponentFormValues = z.infer<typeof componentSchema>;

// Only used at creation time — how much usage the component already had
// before joining this bike (e.g. a used part). Not a stored column: it's
// folded into bike_km_at_install/bike_hours_at_install on insert.
export const componentInitialUsageSchema = z.object({
  initial_km: optionalNumber(0, 1000000),
  initial_hours: optionalNumber(0, 100000),
});
