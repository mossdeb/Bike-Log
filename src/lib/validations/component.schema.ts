import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().trim().max(max).nullable()
  );

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().int().min(min).max(max).nullable()
  );

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number().min(min).max(max).nullable()
  );

export const componentSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  category: optionalText(60),
  brand: optionalText(120),
  model: optionalText(120),
  serial_number: optionalText(120),
  install_date: optionalText(10), // "YYYY-MM-DD" from <input type="date">
  interval_months: optionalInt(1, 120),
  total_km: optionalNumber(0, 1000000),
  total_hours: optionalNumber(0, 100000),
  notes: optionalText(2000),
});

export type ComponentFormValues = z.infer<typeof componentSchema>;
