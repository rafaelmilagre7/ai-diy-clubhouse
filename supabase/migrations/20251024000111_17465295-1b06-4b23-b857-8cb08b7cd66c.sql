-- Adicionar novos campos para sistema de fluxos inteligentes
ALTER TABLE ai_generated_solutions 
ADD COLUMN IF NOT EXISTS architecture_insights JSONB,
ADD COLUMN IF NOT EXISTS flow_progress JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS user_notes JSONB DEFAULT '{}'::jsonb;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_solutions_flow_progress ON ai_generated_solutions USING gin(flow_progress);
CREATE INDEX IF NOT EXISTS idx_ai_solutions_architecture_insights ON ai_generated_solutions USING gin(architecture_insights);

-- Comentários para documentação
COMMENT ON COLUMN ai_generated_solutions.architecture_insights IS 'Análise estruturada da arquitetura: RAG, CRM, APIs, custos';
COMMENT ON COLUMN ai_generated_solutions.flow_progress IS 'Progresso do usuário por etapa do fluxo {stepId: {completed: boolean, completedAt: timestamp}}';
COMMENT ON COLUMN ai_generated_solutions.user_notes IS 'Anotações do usuário por nó do fluxo {nodeId: string}';