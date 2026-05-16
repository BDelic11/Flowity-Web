import { z } from "zod";
import { hexColorField, uuidField } from "./_shared";

const ServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "validation.name.tooShort")
      .max(120, "validation.name.tooLong"),
    description: z.string().max(2000, "validation.description.tooLong").optional(),
    duration: z
      .number({ invalid_type_error: "validation.duration.required" })
      .int("validation.duration.notInt")
      .min(5, "validation.duration.tooShort")
      .max(480, "validation.duration.tooLong"),
    bufferBefore: z.number().int().min(0).max(120, "validation.buffer.range").optional(),
    bufferAfter: z.number().int().min(0).max(120, "validation.buffer.range").optional(),
    priceMin: z
      .number()
      .min(0, "validation.price.negative")
      .max(1_000_000, "validation.price.tooHigh")
      .optional(),
    priceMax: z
      .number()
      .min(0, "validation.price.negative")
      .max(1_000_000, "validation.price.tooHigh")
      .optional(),
    color: hexColorField,
    assignedStaffIds: z.array(uuidField).min(1, "validation.staff.required"),
  })
  .refine(
    (v) =>
      v.priceMin === undefined ||
      v.priceMax === undefined ||
      v.priceMax >= v.priceMin,
    { path: ["priceMax"], message: "validation.price.range" }
  );

export default ServiceSchema;
export type ServiceInput = z.infer<typeof ServiceSchema>;
