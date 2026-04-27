import { z } from "zod";

export const AcceptInviteSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Add at least one uppercase letter.")
      .regex(/[a-z]/, "Add at least one lowercase letter.")
      .regex(/[0-9]/, "Add at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match.",
  });

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
