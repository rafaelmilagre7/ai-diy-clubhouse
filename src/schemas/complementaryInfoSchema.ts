
import { z } from "zod";

export const complementaryInfoSchema = z.object({
  how_found_us: z.string({
    required_error: "Por favor, selecione como nos conheceu",
  }),
  referred_by: z.string({
    required_error: "Por favor, informe quem te indicou",
  }),
  priority_topics: z.array(z.string()).min(1, {
    message: "Selecione pelo menos 1 tópico prioritário",
  }).max(5, {
    message: "Selecione no máximo 5 tópicos prioritários",
  }),
  authorize_case_usage: z.boolean().default(false),
  interested_in_interview: z.boolean().default(false),
});

export type ComplementaryInfoFormData = z.infer<typeof complementaryInfoSchema>;
