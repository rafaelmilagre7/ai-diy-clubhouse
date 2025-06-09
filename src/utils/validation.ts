
import { z } from 'zod';

// Schemas de validação seguros
export const emailSchema = z.string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(255, 'Email muito longo')
  .refine((email) => {
    // Validação adicional de segurança
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [local, domain] = parts;
    if (local.length > 64 || domain.length > 253) return false;
    
    return true;
  }, 'Formato de email inválido');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,20}$/, 'Telefone inválido')
  .transform((phone) => phone.replace(/[^\d+]/g, ''));

export const nameSchema = z.string()
  .min(2, 'Nome muito curto')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s\-\'\.]+$/, 'Nome contém caracteres inválidos')
  .transform((name) => name.trim());

export const companyNameSchema = z.string()
  .min(2, 'Nome da empresa muito curto')
  .max(150, 'Nome da empresa muito longo')
  .regex(/^[a-zA-ZÀ-ÿ0-9\s\-\&\.\,\']+$/, 'Nome da empresa contém caracteres inválidos')
  .transform((name) => name.trim());

export const urlSchema = z.string()
  .url('URL inválida')
  .max(2048, 'URL muito longa')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      // Bloquear protocolos perigosos
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL não permitida');

// Sanitização de HTML para prevenir XSS
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validação de entrada para onboarding
export const personalInfoSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  whatsapp: phoneSchema,
  country_code: z.string().regex(/^\+\d{1,4}$/, 'Código de país inválido'),
  birth_date: z.string().optional().refine((date) => {
    if (!date) return true;
    const parsed = new Date(date);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
    const maxAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    
    return parsed >= minAge && parsed <= maxAge;
  }, 'Data de nascimento inválida'),
  linkedin_url: urlSchema.optional().or(z.literal('')),
  instagram_url: z.string().optional().refine((url) => {
    if (!url) return true;
    return url.startsWith('@') || urlSchema.safeParse(url).success;
  }, 'URL do Instagram inválida'),
  how_found_us: z.enum([
    'google', 'linkedin', 'instagram', 'youtube', 
    'indicacao', 'evento', 'podcast', 'outro'
  ]),
  referred_by: z.string().max(100, 'Nome muito longo').optional()
});

export const professionalInfoSchema = z.object({
  company_name: companyNameSchema,
  role: z.string().min(2, 'Cargo muito curto').max(100, 'Cargo muito longo'),
  company_size: z.enum([
    '1-10', '11-50', '51-200', '201-500', 
    '501-1000', '1001-5000', '5000+'
  ]),
  company_segment: z.string().min(2, 'Segmento muito curto').max(100, 'Segmento muito longo'),
  annual_revenue_range: z.enum([
    'ate-100k', '100k-500k', '500k-1m', '1m-5m', 
    '5m-10m', '10m-50m', '50m+'
  ]),
  main_challenge: z.string().min(10, 'Descreva melhor o desafio').max(500, 'Descrição muito longa')
});

export const aiExperienceSchema = z.object({
  ai_knowledge_level: z.enum(['iniciante', 'intermediario', 'avancado']),
  uses_ai: z.enum(['sim', 'nao', 'as_vezes']),
  main_goal: z.string().min(10, 'Descreva melhor seu objetivo').max(500, 'Descrição muito longa'),
  has_implemented: z.enum(['sim', 'nao', 'planejando']),
  desired_ai_areas: z.array(z.string()).min(1, 'Selecione pelo menos uma área')
});

// Função para validar arquivos de upload
export const validateFileUpload = (file: File, allowedTypes: string[], maxSizeMB: number) => {
  const errors: string[] = [];
  
  // Verificar tipo de arquivo
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de arquivo não permitido. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  // Verificar tamanho
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`Arquivo muito grande. Máximo: ${maxSizeMB}MB`);
  }
  
  // Verificar nome do arquivo
  if (file.name.length > 255) {
    errors.push('Nome do arquivo muito longo');
  }
  
  // Verificar caracteres perigosos no nome
  if (/[<>:"/\\|?*]/.test(file.name)) {
    errors.push('Nome do arquivo contém caracteres inválidos');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
