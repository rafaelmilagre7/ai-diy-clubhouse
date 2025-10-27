-- Passo 1: Remover registros duplicados mantendo apenas o mais recente
DELETE FROM unified_checklists 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, solution_id, checklist_type, is_template) id
  FROM unified_checklists
  WHERE is_template = false
  ORDER BY user_id, solution_id, checklist_type, is_template, updated_at DESC
);

-- Passo 2: Adicionar constraint UNIQUE para prevenir duplicatas futuras
ALTER TABLE unified_checklists 
ADD CONSTRAINT unique_user_checklist 
UNIQUE (user_id, solution_id, checklist_type, is_template);