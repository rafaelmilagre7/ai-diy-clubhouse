
import { z } from "zod";

// Schema mais flexível para URLs opcionais
const optionalUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((val) => val === "" ? undefined : val)
  .refine((val) => {
    if (!val) return true; // Permitir valores vazios
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "URL inválida");

export const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Data e hora de início são obrigatórias"),
  end_time: z.string().min(1, "Data e hora de fim são obrigatórias"),
  location_link: optionalUrlSchema,
  physical_location: z.string().optional(),
  cover_image_url: z.string().optional(),
  // Campos para controle de acesso
  role_ids: z.array(z.string()).optional(),
  // Campos para eventos recorrentes - todos opcionais e nullable
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().nullable().optional(),
  recurrence_interval: z.number().nullable().optional(),
  recurrence_day: z.number().min(0).max(6).nullable().optional(),
  recurrence_count: z.number().nullable().optional(),
  recurrence_end_date: z.string().nullable().optional()
}).refine((data) => {
  // Validar que a data de fim é posterior à data de início
  if (data.start_time && data.end_time) {
    return new Date(data.start_time) < new Date(data.end_time);
  }
  return true;
}, {
  message: "Data e hora de fim devem ser posteriores ao início",
  path: ["end_time"]
}).transform((data) => {
  // Transformar valores vazios para null em campos de recorrência
  return {
    ...data,
    recurrence_pattern: data.recurrence_pattern || null,
    recurrence_interval: data.recurrence_interval || null,
    recurrence_day: data.recurrence_day || null,
    recurrence_count: data.recurrence_count || null,
    recurrence_end_date: data.recurrence_end_date || null,
  };
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
