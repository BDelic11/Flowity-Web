import { z } from "zod";
import {
  emailField,
  optionalPhoneField,
  personNameField,
} from "./_shared";

export const createStaffSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  email: emailField,
  phone: optionalPhoneField,
});
export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  phone: optionalPhoneField,
  isActive: z.boolean(),
});
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
