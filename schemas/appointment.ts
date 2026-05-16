import { z } from "zod";
import { dateField, timeField, uuidField } from "./_shared";

const AppointmentZ = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "validation.booking.clientNameTooShort")
    .max(120, "validation.booking.clientNameTooLong"),
  staffId: uuidField,
  serviceId: uuidField,
  date: dateField,
  time: timeField,
  notes: z.string().max(2000, "validation.notes.tooLong").optional(),
});

export default AppointmentZ;
export type AppointmentInput = z.infer<typeof AppointmentZ>;
