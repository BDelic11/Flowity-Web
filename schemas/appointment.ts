import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const AppointmentZ = z.object({
  clientName: z.string().trim().min(2, "Too short").max(120, "Too long"),
  staffId: z.string().min(1, "Required"),
  serviceId: z.string().min(1, "Required"),
  date: z.string().regex(dateRegex, "Invalid date"),
  time: z.string().regex(timeRegex, "Invalid time"),
  notes: z.string().max(1000, "Too long").optional(),
});

export type AppointmentInput = z.infer<typeof AppointmentZ>;
