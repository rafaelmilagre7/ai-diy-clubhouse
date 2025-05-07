
import * as z from "zod";

// Esquema para vídeos - agora suportando Panda Video
const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  url: z.string().min(1, "URL do vídeo é obrigatória"),
  type: z.enum(["youtube", "panda"]),
  video_id: z.string().optional(),
  thumbnail_url: z.string().optional(),
  duration_seconds: z.number().optional()
});

// Esquema para materiais
const materialSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  url: z.string().min(1, "URL do material é obrigatória"),
  type: z.string().min(1, "Tipo do material é obrigatório"),
  file_size: z.number().optional()
});

// Esquema completo do formulário
export const aulaFormSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  objective: z.string().optional(),
  difficulty: z.string().min(1, "Nível de dificuldade é obrigatório"),
  estimated_time: z.string().optional(),
  thumbnail_url: z.string().optional(),
  videos: z.array(videoSchema).min(1, "Adicione pelo menos um vídeo"),
  materials: z.array(materialSchema).optional().default([]),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false)
});
