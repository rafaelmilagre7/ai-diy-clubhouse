
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  location_link: z.string().url("Link inválido"),
  physical_location: z.string().optional(),
  cover_image_url: z.string().optional(),
  // Campos para controle de acesso
  role_ids: z.array(z.string()).optional(),
  // Campos para eventos recorrentes
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  recurrence_interval: z.number().min(1).optional(),
  recurrence_day: z.number().min(0).max(6).optional(),
  recurrence_count: z.number().optional(),
  recurrence_end_date: z.string().optional()
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
