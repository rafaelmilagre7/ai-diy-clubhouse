-- Adicionar coluna architecture_flowchart para armazenar o fluxograma mermaid
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS architecture_flowchart JSONB;

COMMENT ON COLUMN ai_generated_solutions.architecture_flowchart 
IS 'Fluxograma mermaid da arquitetura técnica completa da solução';

-- Adicionar índice GIN para queries eficientes em JSONB
CREATE INDEX IF NOT EXISTS idx_architecture_flowchart 
ON ai_generated_solutions USING GIN (architecture_flowchart);