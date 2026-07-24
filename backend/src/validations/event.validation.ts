import { z } from "zod";

export const eventSchema = z.object({
  artistId: z.string().min(1, "Artist wajib dipilih"),

  title: z.string().min(3, "Judul event minimal 3 karakter"),

  description: z.string().min(5, "Deskripsi minimal 5 karakter"),

  location: z.string().min(3, "Lokasi wajib diisi"),

  eventDate: z.string().datetime("Format tanggal tidak valid"),
});

export type EventInput = z.infer<typeof eventSchema>;