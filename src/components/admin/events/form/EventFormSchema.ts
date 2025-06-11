
import { z } from "zod";

// Schema simplificado e menos restritivo para URLs opcionais
const optionalUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((val) => val === "" ? undefined : val);

export const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Data e hora de início são obrigatórias"),
  end_time: z.string().min(1, "Data e hora de fim são obrigatórias"),
  location_link: optionalUrlSchema,
  physical_location: z.string().optional(),
  cover_image_url: z.string().optional(),
  
  // Campos para eventos recorrentes - todos opcionais
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  recurrence_interval: z.number().optional(),
  recurrence_day: z.number().min(0).max(6).optional(),
  recurrence_count: z.number().optional(),
  recurrence_end_date: z.string().optional()
}).refine((data) => {
  // Validação simples de data de fim posterior ao início
  if (data.start_time && data.end_time) {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return start < end;
  }
  return true;
}, {
  message: "Data de fim deve ser posterior ao início",
  path: ["end_time"]
});

export type EventFormData = z.infer<typeof eventSchema>;

// Tipos de padrões de recorrência
export const recurrencePatterns = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" }
] as const;

export const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" }
] as const;
