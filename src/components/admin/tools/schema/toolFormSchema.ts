
import { z } from 'zod';

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
  ).default([])
});
