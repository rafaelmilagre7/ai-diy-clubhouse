
import { z } from "zod";

export const solutionFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  category: z.enum(["Receita", "Operacional", "Estratégia"], {
    required_error: "Por favor, selecione uma categoria.",
  }).optional(),
  difficulty: z.enum(["easy", "medium", "advanced"], {
    required_error: "Por favor, selecione uma dificuldade.",
  }),
  thumbnail_url: z.string().url({
    message: "Por favor, insira uma URL de imagem válida.",
  }).optional().or(z.literal("")),
  published: z.boolean().default(false),
  slug: z.string().min(3, {
    message: "O slug deve ter pelo menos 3 caracteres.",
  }).optional(),
  tags: z.array(z.string()).default([]).optional(),
});

export type SolutionFormValues = z.infer<typeof solutionFormSchema>;
