-- Adicionar campo implementation_flow (singular) à tabela ai_generated_solutions
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS implementation_flow JSONB;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_solutions_implementation_flow 
ON ai_generated_solutions USING GIN (implementation_flow);

-- Comentário descritivo
COMMENT ON COLUMN ai_generated_solutions.implementation_flow IS 'Fluxo único de implementação gerado pela IA (Mermaid diagram + metadata)';