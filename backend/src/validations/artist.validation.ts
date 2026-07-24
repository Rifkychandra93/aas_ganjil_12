import { z } from "zod";

export const artistSchema = z.object({
  name: z
    .string()
    .min(3, "Nama artist minimal 3 karakter"),

  description: z
    .string()
    .optional()
});

export type ArtistInput = z.infer<typeof artistSchema>;