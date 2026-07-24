import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter"),

  email: z
    .email("Format email tidak valid"),

  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi")
  });
  
  export type LoginInput = z.infer<typeof loginSchema>;