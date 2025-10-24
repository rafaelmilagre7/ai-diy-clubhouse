-- ============================================
-- FASE 4: OTIMIZAÇÃO BACKEND - KANBAN TRELLO
-- ============================================

-- 1. Adicionar colunas para labels e members no unified_checklists
ALTER TABLE unified_checklists 
ADD COLUMN IF NOT EXISTS labels jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS members jsonb DEFAULT '[]';

-- 2. Adicionar índices de performance
CREATE INDEX IF NOT EXISTS idx_unified_checklists_solution_id 
ON unified_checklists(solution_id);

CREATE INDEX IF NOT EXISTS idx_unified_checklists_user_id 
ON unified_checklists(user_id);

CREATE INDEX IF NOT EXISTS idx_unified_checklists_checklist_type 
ON unified_checklists(checklist_type);

CREATE INDEX IF NOT EXISTS idx_unified_checklists_labels 
ON unified_checklists USING GIN(labels);

CREATE INDEX IF NOT EXISTS idx_unified_checklists_members 
ON unified_checklists USING GIN(members);

-- Índice composto para queries frequentes
CREATE INDEX IF NOT EXISTS idx_unified_checklists_user_solution_type 
ON unified_checklists(user_id, solution_id, checklist_type);

-- Índice GIN para busca em JSONB (checklist_data)
CREATE INDEX IF NOT EXISTS idx_unified_checklists_checklist_data_gin 
ON unified_checklists USING GIN(checklist_data);

-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_unified_checklists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS set_updated_at_unified_checklists ON unified_checklists;
CREATE TRIGGER set_updated_at_unified_checklists
BEFORE UPDATE ON unified_checklists
FOR EACH ROW
EXECUTE FUNCTION update_unified_checklists_updated_at();

-- 4. Comentários para documentação
COMMENT ON COLUMN unified_checklists.labels IS 'Array de labels/tags para categorização dos cards do Kanban';
COMMENT ON COLUMN unified_checklists.members IS 'Array de membros atribuídos aos cards do Kanban';
COMMENT ON INDEX idx_unified_checklists_solution_id IS 'Índice para queries por solution_id';
COMMENT ON INDEX idx_unified_checklists_labels IS 'Índice GIN para busca eficiente de labels';
COMMENT ON INDEX idx_unified_checklists_members IS 'Índice GIN para busca eficiente de members';