
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
