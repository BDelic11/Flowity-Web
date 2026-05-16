import { z } from "zod";
import { ALLOWED_PRODUCT_UNITS, optionalHttpUrlField } from "./_shared";

const baseProductFields = {
  name: z
    .string()
    .trim()
    .min(2, "validation.name.tooShort")
    .max(120, "validation.name.tooLong"),
  unit: z.enum(ALLOWED_PRODUCT_UNITS, {
    errorMap: () => ({ message: "validation.unit.invalid" }),
  }),
  pricePerUnit: z
    .number({ invalid_type_error: "validation.price.required" })
    .min(0, "validation.price.negative")
    .max(1_000_000, "validation.price.tooHigh"),
  lowStockThreshold: z
    .number({ invalid_type_error: "validation.threshold.required" })
    .min(0, "validation.threshold.negative")
    .max(1_000_000, "validation.threshold.tooHigh"),
  description: z.string().max(2000, "validation.description.tooLong").optional(),
  category: z.string().max(120, "validation.category.tooLong").optional(),
  imageUrl: optionalHttpUrlField,
};

export const createProductSchema = z.object({
  ...baseProductFields,
  stockQty: z
    .number({ invalid_type_error: "validation.stock.required" })
    .min(0, "validation.stock.negative")
    .max(1_000_000, "validation.stock.tooHigh"),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  ...baseProductFields,
  isActive: z.boolean(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const recordPurchaseSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "validation.quantity.required" })
    .gt(0, "validation.quantity.gtZero")
    .max(1_000_000, "validation.quantity.tooHigh"),
  unitCost: z
    .number()
    .min(0, "validation.price.negative")
    .max(1_000_000, "validation.price.tooHigh")
    .optional(),
  note: z.string().max(500, "validation.note.tooLong").optional(),
});
export type RecordPurchaseInput = z.infer<typeof recordPurchaseSchema>;

export const adjustStockSchema = z.object({
  delta: z
    .number({ invalid_type_error: "validation.delta.required" })
    .refine((v) => v !== 0, "validation.delta.zero")
    .refine((v) => v >= -1_000_000 && v <= 1_000_000, "validation.delta.outOfRange"),
  note: z.string().max(500, "validation.note.tooLong").optional(),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
