-- =====================================================
-- IMPLEMENTAÇÃO PRÁTICA NO-CODE - Novos Fluxos
-- =====================================================

-- Adicionar colunas para os 4 fluxos práticos
ALTER TABLE ai_generated_solutions
ADD COLUMN IF NOT EXISTS automation_journey_flow JSONB,
ADD COLUMN IF NOT EXISTS ai_architecture_tree JSONB,
ADD COLUMN IF NOT EXISTS deploy_checklist_structured JSONB,
ADD COLUMN IF NOT EXISTS api_integration_map JSONB;

-- Comentários explicativos
COMMENT ON COLUMN ai_generated_solutions.automation_journey_flow IS 'Timeline de automação passo-a-passo com ferramentas';
COMMENT ON COLUMN ai_generated_solutions.ai_architecture_tree IS 'Árvore de decisão de modelos de IA';
COMMENT ON COLUMN ai_generated_solutions.deploy_checklist_structured IS 'Checklist interativo de deployment';
COMMENT ON COLUMN ai_generated_solutions.api_integration_map IS 'Mapa de integrações entre APIs';