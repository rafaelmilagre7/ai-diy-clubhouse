
import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  location_link: z.string().url("Link inválido"),
  physical_location: z.string().optional(),
  cover_image_url: z.string().optional()
});

export type EventFormData = z.infer<typeof eventSchema>;
