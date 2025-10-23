-- Adicionar coluna tags na tabela ai_generated_solutions
-- Permite categorizar soluções geradas (ex: 'Automação', 'WhatsApp', 'IA Generativa')

ALTER TABLE public.ai_generated_solutions 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY['IA Generativa']::text[];

-- Comentário na coluna
COMMENT ON COLUMN public.ai_generated_solutions.tags IS 'Tags de categorização da solução (automação, IA, integrações, etc)';

-- Criar índice para buscas por tags
CREATE INDEX IF NOT EXISTS idx_ai_generated_solutions_tags 
ON public.ai_generated_solutions USING GIN(tags);

-- Atualizar soluções existentes que não têm tags
UPDATE public.ai_generated_solutions 
SET tags = ARRAY['IA Generativa']::text[]
WHERE tags IS NULL;