import { z } from "zod";

export const ticketCategorySchema = z.object({
  eventId: z.string().min(1, "Event wajib dipilih"),

  name: z.string().min(2, "Nama kategori minimal 2 karakter"),

  price: z.number().int().positive("Harga harus lebih dari 0"),

  quota: z.number().int().positive("Kuota harus lebih dari 0"),
});

export type TicketCategoryInput = z.infer<
  typeof ticketCategorySchema
>;