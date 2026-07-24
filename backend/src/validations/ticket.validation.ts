import { z } from "zod";

export const ticketSchema = z.object({
  eventId: z.string().min(1, "Event wajib dipilih"),

  name: z.string().min(2),

  price: z.number().positive(),

  stock: z.number().int().positive()
});

export type TicketInput = z.infer<typeof ticketSchema>;