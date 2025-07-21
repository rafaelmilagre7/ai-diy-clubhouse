
import { z } from "zod";

// Definição do schema para validação do formulário
export const resourceFormSchema = z.object({
  overview: z.string().optional(),
  materials: z.string().optional(),
  external_links: z.string().optional(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;
