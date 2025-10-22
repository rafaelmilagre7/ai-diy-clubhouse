-- Fase 5: Adicionar campos para múltiplos diagramas
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS data_flow_diagram JSONB,
ADD COLUMN IF NOT EXISTS user_journey_map JSONB,
ADD COLUMN IF NOT EXISTS technical_stack_diagram JSONB;

COMMENT ON COLUMN ai_generated_solutions.data_flow_diagram IS 'Diagrama de fluxo de dados (formato Mermaid)';
COMMENT ON COLUMN ai_generated_solutions.user_journey_map IS 'Mapa de jornada do usuário (formato Mermaid)';
COMMENT ON COLUMN ai_generated_solutions.technical_stack_diagram IS 'Diagrama visual da stack tecnológica (formato Mermaid)';