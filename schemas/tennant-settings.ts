import { z } from "zod";

export const Days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type DayName = (typeof Days)[number];

export const TimeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:mm (e.g., 09:00)");

/** ---- General ---- */
export const GeneralSettingsSchema = z.object({
  salonName: z.string().min(2, "Salon name is required"),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .or(z.literal("").transform(() => undefined))
    .optional(),
  phone: z
    .string()
    .trim()
    .min(5, "Phone is required")
    .max(32, "Phone too long"),
  address: z.string().min(3, "Address is required"),
});
export type GeneralSettingsInput = z.infer<typeof GeneralSettingsSchema>;

/** ---- Business Hours ---- */
export const BusinessHoursRowSchema = z.object({
  day: z.enum(Days),
  enabled: z.boolean(),
  open: TimeString.optional(),
  close: TimeString.optional(),
});
export type BusinessHoursRow = z.infer<typeof BusinessHoursRowSchema>;

export const BusinessHoursSchema = z
  .array(BusinessHoursRowSchema)
  .length(7, "Seven days required")
  .superRefine((rows, ctx) => {
    const indexByDay = new Map(Days.map((d, i) => [d, i]));
    // Must be in canonical order & unique
    if (new Set(rows.map((r) => r.day)).size !== 7) {
      ctx.addIssue({ code: "custom", message: "Duplicate day entries" });
    }
    // Validate time logic for enabled days
    rows.forEach((r, i) => {
      if (r.enabled) {
        if (!r.open || !r.close) {
          ctx.addIssue({
            code: "custom",
            path: [i],
            message: `${r.day}: open and close are required`,
          });
          return;
        }
        const [oh, om] = r.open.split(":").map(Number);
        const [ch, cm] = r.close.split(":").map(Number);
        const openMin = oh * 60 + om;
        const closeMin = ch * 60 + cm;
        if (closeMin <= openMin) {
          ctx.addIssue({
            code: "custom",
            path: [i],
            message: `${r.day}: close must be after open`,
          });
        }
      }
    });
    rows.forEach((r, i) => {
      if (indexByDay.get(r.day) !== i) {
        ctx.addIssue({
          code: "custom",
          path: [i],
          message: "Days must be in order Monday..Sunday",
        });
      }
    });
  });

/** ---- Booking ---- */
export const BookingSettingsSchema = z.object({
  autoConfirmBookings: z.boolean(),
  bufferMinBetweenAppointments: z
    .number()
    .int()
    .min(0, "Buffer must be ≥ 0")
    .max(30, "Buffer must be ≤ 30"),
  maxAdvanceDays: z.number().int().min(7).max(120),
  minLeadTimeMin: z.number().int().min(0).max(1440),
});
export type BookingSettingsInput = z.infer<typeof BookingSettingsSchema>;
