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

export const interventionSchema = z.object({
  type: z.enum(["service", "repair", "replacement"]),
  date: z.string().trim().min(1, "Date is required"),
  hours_used: optionalNumber(0, 100000),
  kms: optionalNumber(0, 1000000),
  description: optionalText(500),
  notes: optionalText(2000),
});

export type InterventionFormValues = z.infer<typeof interventionSchema>;
