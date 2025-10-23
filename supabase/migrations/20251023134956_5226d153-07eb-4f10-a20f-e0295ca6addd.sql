-- Migration: Permitir geração em duas etapas (quick + on-demand)

-- 1. Permitir NULL nos campos de conteúdo detalhado
ALTER TABLE public.ai_generated_solutions 
  ALTER COLUMN framework_mapping DROP NOT NULL,
  ALTER COLUMN required_tools DROP NOT NULL,
  ALTER COLUMN implementation_checklist DROP NOT NULL,
  ALTER COLUMN architecture_flowchart DROP NOT NULL,
  ALTER COLUMN data_flow_diagram DROP NOT NULL,
  ALTER COLUMN user_journey_map DROP NOT NULL,
  ALTER COLUMN technical_stack_diagram DROP NOT NULL,
  ALTER COLUMN lovable_prompt DROP NOT NULL;

-- 2. Adicionar campo de status de geração
ALTER TABLE public.ai_generated_solutions 
  ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'complete';

COMMENT ON COLUMN public.ai_generated_solutions.generation_status IS 
  'Status da geração: "quick" (apenas overview), "partial" (algumas seções), "complete" (tudo gerado)';

-- 3. Criar índice para buscar soluções parciais
CREATE INDEX IF NOT EXISTS idx_ai_solutions_generation_status 
  ON public.ai_generated_solutions(generation_status);

-- 4. Atualizar soluções existentes como "complete"
UPDATE public.ai_generated_solutions 
SET generation_status = 'complete' 
WHERE generation_status IS NULL;