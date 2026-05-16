import { z } from "zod";

export const setWhatsappChannelSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .min(1, "validation.whatsapp.required")
    .max(40, "validation.whatsapp.tooLong")
    .regex(/^(whatsapp:)?\+?[0-9]{6,20}$/, "validation.whatsapp.format"),
});
export type SetWhatsappChannelInput = z.infer<typeof setWhatsappChannelSchema>;
