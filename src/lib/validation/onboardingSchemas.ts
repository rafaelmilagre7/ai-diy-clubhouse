
import { z } from 'zod';

// Schema para informações pessoais
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  company_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  main_goal: z.string().min(5, 'Objetivo principal deve ser mais específico'),
});

// Schema para experiência com IA
export const aiExperienceSchema = z.object({
  ai_knowledge_level: z.enum(['iniciante', 'intermediario', 'avancado'], {
    required_error: 'Selecione seu nível de conhecimento em IA'
  }),
  previous_tools: z.array(z.string()).optional(),
  desired_ai_areas: z.array(z.string()).min(1, 'Selecione pelo menos uma área de interesse'),
  has_implemented: z.enum(['sim', 'nao'], {
    required_error: 'Informe se já implementou soluções de IA'
  })
});

// Schema completo do onboarding
export const completeOnboardingSchema = z.object({
  personal_info: personalInfoSchema,
  ai_experience: aiExperienceSchema,
  is_completed: z.boolean().default(false)
});

// Tipos derivados dos schemas
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type AIExperienceData = z.infer<typeof aiExperienceSchema>;
export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>;

// Função para validar dados parciais
export const validatePartialData = (data: any, step: string) => {
  try {
    switch (step) {
      case 'personal_info':
        return { success: true, data: personalInfoSchema.parse(data) };
      case 'ai_experience':
        return { success: true, data: aiExperienceSchema.parse(data) };
      default:
        return { success: false, error: 'Etapa desconhecida' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, error: 'Erro de validação' };
  }
};

// Função para sanitizar dados
export const sanitizeOnboardingData = (data: any) => {
  const sanitized = { ...data };
  
  // Limpar strings
  if (sanitized.personal_info) {
    Object.keys(sanitized.personal_info).forEach(key => {
      if (typeof sanitized.personal_info[key] === 'string') {
        sanitized.personal_info[key] = sanitized.personal_info[key].trim();
      }
    });
  }
  
  // Garantir arrays válidos
  if (sanitized.ai_experience) {
    if (!Array.isArray(sanitized.ai_experience.previous_tools)) {
      sanitized.ai_experience.previous_tools = [];
    }
    if (!Array.isArray(sanitized.ai_experience.desired_ai_areas)) {
      sanitized.ai_experience.desired_ai_areas = [];
    }
  }
  
  return sanitized;
};
