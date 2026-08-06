import { z } from "zod";

export const orderSchema = z.object({
  paymentMethod: z.enum(["TRANSFER", "EWALLET"]),

  items: z.array(
    z.object({
      ticketCategoryId: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
});

export type OrderInput = z.infer<typeof orderSchema>;