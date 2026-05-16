import { z } from "zod";
import { emailField, passwordField, personNameField } from "./_shared";

export const registerSchema = z
  .object({
    email: emailField,
    firstName: personNameField,
    lastName: personNameField,
    password: passwordField,
    confirmPassword: z.string().min(1, "validation.password.confirm"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.password.mismatch",
  });

export type RegisterValues = z.infer<typeof registerSchema>;
