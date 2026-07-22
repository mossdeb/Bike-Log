import { z } from "zod";

const currentYear = new Date().getFullYear();

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.string().trim().max(max).nullable()
  );

const optionalYear = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce.number().int().min(1900).max(currentYear + 1).nullable()
);

export const bikeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  brand: optionalText(120),
  model: optionalText(120),
  year: optionalYear,
  type: optionalText(60),
  color: optionalText(60),
  serial_number: optionalText(120),
  notes: optionalText(2000),
});

export type BikeFormValues = z.infer<typeof bikeSchema>;
