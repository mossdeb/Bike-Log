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

const currentYear = new Date().getFullYear();

const optionalYear = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce.number().int().min(1900).max(currentYear + 1).nullable()
);

export const componentSchema = z.object({
  name: optionalText(120),
  category: z.string().trim().min(1, "Category is required").max(60),
  brand: z.string().trim().min(1, "Brand is required").max(120),
  model: z.string().trim().min(1, "Model is required").max(120),
  serial_number: optionalText(120),
  install_date: optionalText(10), // "YYYY-MM-DD" from <input type="date">
  notes: optionalText(2000),
  purchase_date: optionalText(10), // "YYYY-MM-DD" from <input type="date">
  warranty: optionalText(120),
  year: optionalYear,
});

export type ComponentFormValues = z.infer<typeof componentSchema>;

// A component has 0-3 independent, named maintenance intervals (e.g. "Fork
// lower leg service" every 200km) — each submitted as a
// interval_name_{slot}/interval_type_{slot}/interval_value_{slot} field
// triplet, parsed into this shape per configured slot.
export const componentIntervalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  interval_type: z.enum(INTERVAL_TYPES),
  interval_value: z.coerce.number().min(0.1).max(1000000),
});

export type ComponentIntervalFormValues = z.infer<typeof componentIntervalSchema>;

// Only used at creation time — how much usage the component already had
// before joining this bike (e.g. a used part). Not a stored column: it's
// folded into bike_km_at_install/bike_hours_at_install on insert.
export const componentInitialUsageSchema = z.object({
  initial_km: optionalNumber(0, 1000000),
  initial_hours: optionalNumber(0, 100000),
});
