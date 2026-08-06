import { z } from "zod";

export const scanSchema = z.object({
  ticketCode: z.string().min(1),
});

export type ScanInput = z.infer<typeof scanSchema>;