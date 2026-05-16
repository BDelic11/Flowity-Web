import { z } from "zod";
import { passwordField } from "./_shared";

export const AcceptInviteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "validation.name.tooShort")
      .max(200, "validation.name.tooLong"),
    password: passwordField,
    confirmPassword: z.string().min(1, "validation.password.confirm"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.password.mismatch",
  });

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
