import { z } from "zod";
import { dateField, timeField, uuidField } from "./_shared";

export const createBookingSchema = z
  .object({
    organizationId: uuidField,
    clientName: z
      .string()
      .trim()
      .min(2, "validation.booking.clientNameTooShort")
      .max(120, "validation.booking.clientNameTooLong"),
    serviceCatalogItemId: uuidField,
    workerId: uuidField.optional(),
    date: dateField,
    startTime: timeField,
    endTime: timeField,
    notes: z.string().max(2000, "validation.notes.tooLong").optional(),
  })
  .superRefine((v, ctx) => {
    const [sh, sm] = v.startTime.split(":").map(Number);
    const [eh, em] = v.endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const duration = endMin - startMin;
    if (duration < 5)
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "validation.booking.tooShort",
      });
    if (duration > 8 * 60)
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "validation.booking.tooLong",
      });

    const todayStr = new Date().toISOString().slice(0, 10);
    if (v.date < todayStr)
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "validation.booking.past",
      });
  });
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
