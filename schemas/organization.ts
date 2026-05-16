import { z } from "zod";
import {
  emailField,
  optionalPhoneField,
  phoneField,
} from "./_shared";

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.salonName.required")
    .max(200, "validation.name.tooLong"),
  industry: z.string().min(1, "validation.industry.required").max(120, "validation.tooLong"),
  email: emailField,
  phone: optionalPhoneField,
  address: z.string().trim().max(500, "validation.address.tooLong").optional(),
  timeZone: z.string().min(1, "validation.tz.required").max(200, "validation.tooLong"),
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "validation.salonName.required")
    .max(200, "validation.name.tooLong"),
  email: emailField,
  phone: phoneField,
  address: z
    .string()
    .trim()
    .min(3, "validation.address.required")
    .max(500, "validation.address.tooLong"),
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
