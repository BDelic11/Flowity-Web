import { z } from "zod";
import { emailField } from "./_shared";

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "validation.password.required")
    .max(72, "validation.password.max72"),
});

export type LoginValues = z.infer<typeof loginSchema>;
