
import { z } from 'zod';
import { BenefitType } from '@/types/toolTypes';

export const toolFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  official_url: z.string().url('URL inválida'),
  category: z.string(),
  status: z.boolean().default(true),
  logo_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  video_tutorials: z.array(
    z.object({
      title: z.string().min(1, 'Título é obrigatório'),
      url: z.string().url('URL inválida'),
      type: z.enum(['youtube', 'upload']),
    })
  ).default([]),
  has_member_benefit: z.boolean().default(false),
  benefit_type: z.enum(['discount', 'exclusive', 'free', 'trial', 'other'] as const).optional(),
  benefit_title: z.string().optional(),
  benefit_description: z.string().optional(),
  benefit_link: z.string().url('URL inválida').optional().or(z.literal('')),
  benefit_badge_url: z.string().optional(),
  // Campo auxiliar para rastrear modificações, com valor padrão true para novos formulários
  formModified: z.boolean().default(false)
});
