-- FASE 1: Adicionar coluna title para títulos personalizados de soluções
-- Adicionar coluna title
ALTER TABLE public.ai_generated_solutions 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Criar índice para busca otimizada (português)
CREATE INDEX IF NOT EXISTS idx_ai_solutions_title 
ON public.ai_generated_solutions 
USING gin (to_tsvector('portuguese', title));

-- Backfill: Preencher títulos existentes com base na ideia original (truncado)
UPDATE public.ai_generated_solutions 
SET title = CASE 
  WHEN length(original_idea) > 60 THEN substring(original_idea, 1, 57) || '...'
  ELSE original_idea 
END
WHERE title IS NULL;

-- Comentário para documentação
COMMENT ON COLUMN public.ai_generated_solutions.title IS 
'Título personalizado gerado por IA para a solução (máx 60 caracteres)';