import z from "zod";

const ServiceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  duration: z
    .number()
    .min(15, "Duration must be at least 15 minutes.")
    .max(480, "Duration must be less than 8 hours."),
  price: z.number().min(0, "Price cannot be negative."),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Color must be a valid hex code."),
  assignedStaffIds: z
    .array(z.string())
    .min(1, "At least one staff member is required")
    .optional(),
});
export default ServiceSchema;
