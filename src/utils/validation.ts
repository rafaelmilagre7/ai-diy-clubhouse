
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
  current_position: z.enum([
    'CEO', 'CTO', 'CFO', 'CMO', 'COO', 'Diretor', 'Gerente', 
    'Coordenador', 'Analista Senior', 'Analista Pleno', 'Analista Junior', 
    'Assistente', 'Consultor', 'Especialista', 'Supervisor', 
    'Empreendedor', 'Freelancer', 'Outro'
  ]),
  company_size: z.enum([
    'Solo', '2-5', '6-10', '11-25', '26-50', '51-100', 
    '101-250', '251-500', '501-1000', '1001-5000', '5000+'
  ]),
  company_sector: z.enum([
    'Tecnologia', 'E-commerce', 'Varejo', 'Saúde', 'Educação', 'Financeiro',
    'Seguros', 'Consultoria', 'Marketing', 'Advocacia', 'Contabilidade',
    'Imobiliário', 'Construção', 'Indústria', 'Logística', 'Alimentação',
    'Turismo', 'Beleza', 'Fitness', 'Agricultura', 'ONG', 'Governo',
    'Energia', 'Telecomunicações', 'Mídia', 'Outro'
  ]),
  annual_revenue: z.enum([
    '0-50k', '50k-100k', '100k-250k', '250k-500k', '500k-1m', '1m-2m',
    '2m-5m', '5m-10m', '10m-50m', '50m-100m', '100m+', 'nao-divulgar'
  ]),
  main_challenge: z.enum([
    'Aumentar vendas', 'Reduzir custos', 'Melhorar eficiência', 'Automatizar processos',
    'Atrair clientes', 'Reter clientes', 'Melhorar atendimento', 'Contratar talentos',
    'Capacitar equipe', 'Transformação digital', 'Presença online', 'Gestão financeira',
    'Expandir negócio', 'Inovação', 'Competitividade', 'Compliance', 'Sustentabilidade', 'Outro'
  ]).optional()
});

export const aiExperienceSchema = z.object({
  experience_level: z.enum(['beginner', 'basic', 'intermediate', 'advanced']),
  implementation_status: z.enum(['not_started', 'exploring', 'testing', 'implementing', 'advanced']),
  implementation_approach: z.enum(['myself', 'team', 'hire']),
  current_tools: z.array(z.string()).optional(),
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
