import { z } from "zod";
import { optionalPhoneField, personNameField } from "./_shared";

export const updateProfileSchema = z.object({
  firstName: personNameField,
  lastName: personNameField,
  phone: optionalPhoneField,
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
