import { z } from "zod";

export const rejectOrderSchema = z.object({
  reason: z
    .string()
    .min(5, "Alasan minimal 5 karakter"),
});

export type RejectOrderInput =
  z.infer<typeof rejectOrderSchema>;