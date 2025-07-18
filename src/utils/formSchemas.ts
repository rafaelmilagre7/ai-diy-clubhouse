import { z } from "zod";

// Schema básico para campos comuns
export const commonFieldSchemas = {
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional(),
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  url: z.string().url("URL inválida").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Telefone inválido").optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
};

// Schemas para formulários específicos
export const topicFormSchema = z.object({
  title: commonFieldSchemas.title,
  content: commonFieldSchemas.content,
  categoryId: z.string().uuid("Categoria é obrigatória"),
});

export const replyFormSchema = z.object({
  content: commonFieldSchemas.content,
  topicId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
});

export const reportFormSchema = z.object({
  reason: z.string().min(1, "Motivo é obrigatório"),
  description: z.string().optional(),
  reportType: z.enum(["post", "topic", "user"]),
});

export const profileFormSchema = z.object({
  name: commonFieldSchemas.name,
  email: commonFieldSchemas.email,
  phone: commonFieldSchemas.phone,
  bio: z.string().max(500, "Bio muito longa").optional(),
});

export const toolFormSchema = z.object({
  name: commonFieldSchemas.title,
  description: commonFieldSchemas.description,
  category: z.string().min(1, "Categoria é obrigatória"),
  url: z.string().url("URL inválida"),
  image_url: commonFieldSchemas.url,
  benefits: z.array(z.string()).min(1, "Pelo menos um benefício é obrigatório"),
  pricing_info: z.string().optional(),
});

export type TopicFormValues = z.infer<typeof topicFormSchema>;
export type ReplyFormValues = z.infer<typeof replyFormSchema>;
export type ReportFormValues = z.infer<typeof reportFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ToolFormValues = z.infer<typeof toolFormSchema>;