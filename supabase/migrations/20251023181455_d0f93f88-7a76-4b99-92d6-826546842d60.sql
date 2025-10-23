-- Adicionar coluna implementation_flows para armazenar fluxos Mermaid de implementação
ALTER TABLE public.ai_generated_solutions
ADD COLUMN IF NOT EXISTS implementation_flows JSONB DEFAULT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.ai_generated_solutions.implementation_flows IS 'Fluxos visuais de implementação em formato Mermaid (1-3 fluxos por solução)';

-- Criar índice GIN para busca eficiente em JSONB
CREATE INDEX IF NOT EXISTS idx_ai_generated_solutions_implementation_flows 
ON public.ai_generated_solutions USING GIN (implementation_flows);