import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .min(1, "validation.email.required")
  .max(254, "validation.email.tooLong")
  .email("validation.email.invalid");

export const passwordField = z
  .string()
  .min(8, "validation.password.min8")
  .max(72, "validation.password.max72")
  .regex(/[A-Z]/, "validation.password.uppercase")
  .regex(/[a-z]/, "validation.password.lowercase")
  .regex(/[0-9]/, "validation.password.digit");

export const personNameField = z
  .string()
  .trim()
  .min(2, "validation.name.tooShort")
  .max(100, "validation.name.tooLong")
  .regex(/^[\p{L}\p{M}'\- ]+$/u, "validation.name.invalid");

export const phoneField = z
  .string()
  .trim()
  .regex(/^[+]?[0-9 \-()]{5,32}$/, "validation.phone.invalid");

export const optionalPhoneField = z
  .union([z.literal(""), phoneField])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "validation.time.invalid");

export const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date.invalid");

export const hexColorField = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "validation.color.invalid");

export const uuidField = z.string().uuid("validation.uuid.invalid");

export const httpUrlField = z
  .string()
  .max(2000, "validation.url.tooLong")
  .url("validation.url.invalid")
  .refine((u) => /^https?:\/\//i.test(u), "validation.url.scheme");

export const optionalHttpUrlField = z
  .union([z.literal(""), httpUrlField])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const ALLOWED_PRODUCT_UNITS = ["ml", "g", "kg", "l", "pcs", "kom"] as const;
export type ProductUnit = (typeof ALLOWED_PRODUCT_UNITS)[number];
