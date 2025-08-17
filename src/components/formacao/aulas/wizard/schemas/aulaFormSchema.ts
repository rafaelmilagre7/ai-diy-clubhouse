
import { z } from "zod";
import { DifficultyLevel } from "../types/aulaTypes";

// Schema completo para validação
export const aulaFormSchema = z.object({
  // Etapa 1: Informações Básicas
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  moduleId: z.string().uuid({ message: "Por favor, selecione um módulo válido." }),
  difficultyLevel: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.BEGINNER),
  tags: z.array(z.string()).default([]),
  
  // Etapa 2: Imagem e Mídia
  coverImageUrl: z.string().optional(),
  
  // Etapa 3: Vídeos
  videos: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Título do vídeo é obrigatório"), // CORREÇÃO: título obrigatório
      description: z.string().optional(),
      url: z.string().min(1, "URL do vídeo é obrigatória"), // CORREÇÃO: URL obrigatória  
      type: z.string().optional(),
      fileName: z.string().optional(),
      filePath: z.string().optional(),
      fileSize: z.number().optional(),
      duration_seconds: z.number().optional(),
      thumbnail_url: z.string().optional(),
      video_id: z.string().optional(),
      embedCode: z.string().optional(),
    }).refine((video) => {
      // CORREÇÃO: Validação adicional para Panda Video
      if (video.type === "panda") {
        return video.video_id && video.video_id.length > 0;
      }
      return true;
    }, {
      message: "Video ID do Panda Video é obrigatório"
    })
  ).max(3, { message: "É permitido no máximo 3 vídeos por aula" }).optional().default([]),
  
  // Etapa 4: Materiais
  resources: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Título do material é obrigatório"), // CORREÇÃO: título obrigatório
      description: z.string().optional(),
      url: z.string().min(1, "URL do arquivo é obrigatória"), // CORREÇÃO: URL obrigatória
      type: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
    })
  ).optional().default([]),
  
  // Etapa 5: Publicação
  published: z.boolean().default(false),
  aiAssistantEnabled: z.boolean().default(false),
  aiAssistantId: z.string().optional()
    .refine(val => val === undefined || val === "" || val?.startsWith("asst_"), {
      message: "ID do assistente deve começar com 'asst_'",
    }),
});

export type AulaFormValues = z.infer<typeof aulaFormSchema>;
