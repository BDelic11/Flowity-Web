import { z } from "zod";
import { emailField, phoneField, timeField } from "./_shared";

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

export const TimeString = timeField;

export const GeneralSettingsSchema = z.object({
  salonName: z
    .string()
    .trim()
    .min(2, "validation.salonName.required")
    .max(200, "validation.name.tooLong"),
  contactEmail: z
    .union([z.literal(""), emailField])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phone: phoneField,
  address: z
    .string()
    .trim()
    .min(3, "validation.address.required")
    .max(500, "validation.address.tooLong"),
});
export type GeneralSettingsInput = z.infer<typeof GeneralSettingsSchema>;

export const BusinessHoursRowSchema = z.object({
  day: z.enum(Days),
  enabled: z.boolean(),
  open: TimeString.optional(),
  close: TimeString.optional(),
});
export type BusinessHoursRow = z.infer<typeof BusinessHoursRowSchema>;

export const BusinessHoursSchema = z
  .array(BusinessHoursRowSchema)
  .length(7, "validation.businessHours.length")
  .superRefine((rows, ctx) => {
    const indexByDay = new Map(Days.map((d, i) => [d, i]));
    if (new Set(rows.map((r) => r.day)).size !== 7) {
      ctx.addIssue({ code: "custom", message: "validation.businessHours.dupDays" });
    }
    rows.forEach((r, i) => {
      if (r.enabled) {
        if (!r.open || !r.close) {
          ctx.addIssue({
            code: "custom",
            path: [i],
            message: "validation.businessHours.openClose",
          });
          return;
        }
        const [oh, om] = r.open.split(":").map(Number);
        const [ch, cm] = r.close.split(":").map(Number);
        if (ch * 60 + cm <= oh * 60 + om) {
          ctx.addIssue({
            code: "custom",
            path: [i],
            message: "validation.businessHours.closeBeforeOpen",
          });
        }
      }
      if (indexByDay.get(r.day) !== i) {
        ctx.addIssue({
          code: "custom",
          path: [i],
          message: "validation.businessHours.daysOrder",
        });
      }
    });
  });

export const BookingSettingsSchema = z.object({
  autoConfirmBookings: z.boolean(),
  bufferMinBetweenAppointments: z
    .number()
    .int()
    .min(0, "validation.bookingSettings.bufferRange")
    .max(30, "validation.bookingSettings.bufferRange"),
  maxAdvanceDays: z
    .number()
    .int()
    .min(7, "validation.bookingSettings.advanceRange")
    .max(120, "validation.bookingSettings.advanceRange"),
  minLeadTimeMin: z
    .number()
    .int()
    .min(0, "validation.bookingSettings.leadRange")
    .max(1440, "validation.bookingSettings.leadRange"),
});
export type BookingSettingsInput = z.infer<typeof BookingSettingsSchema>;
