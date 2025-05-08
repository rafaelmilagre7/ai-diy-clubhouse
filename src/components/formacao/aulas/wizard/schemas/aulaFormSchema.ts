
import { z } from "zod";
import { DifficultyLevel } from "../AulaStepWizard";

// Schema completo para validação
export const aulaFormSchema = z.object({
  // Etapa 1: Informações Básicas
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  moduleId: z.string().uuid({ message: "Por favor, selecione um módulo válido." }),
  difficultyLevel: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.BEGINNER),
  
  // Etapa 2: Imagem e Mídia
  coverImageUrl: z.string().optional(),
  
  // Etapa 3: Vídeos
  videos: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().url("Por favor, insira uma URL válida").optional(),
      type: z.string().optional(),
      fileName: z.string().optional(),
      filePath: z.string().optional(),
      fileSize: z.number().optional(),
      duration_seconds: z.number().optional(),
      thumbnail_url: z.string().optional(),
      video_id: z.string().optional(),
      embedCode: z.string().optional(),
    })
  ).max(3, { message: "É permitido no máximo 3 vídeos por aula" }).optional().default([]),
  
  // Etapa 4: Materiais
  resources: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
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
