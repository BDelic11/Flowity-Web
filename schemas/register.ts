import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
