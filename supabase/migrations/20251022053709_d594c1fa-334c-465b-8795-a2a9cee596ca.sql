-- Adicionar coluna lovable_prompt para armazenar prompt completo
ALTER TABLE public.ai_generated_solutions 
ADD COLUMN IF NOT EXISTS lovable_prompt TEXT;

COMMENT ON COLUMN public.ai_generated_solutions.lovable_prompt IS 
'Prompt completo e otimizado para copiar e colar no Lovable.dev, gerado por Claude Sonnet 4-5';