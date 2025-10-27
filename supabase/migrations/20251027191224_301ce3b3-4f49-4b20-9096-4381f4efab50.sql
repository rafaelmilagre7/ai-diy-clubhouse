-- Migração: Corrigir checklists como templates (versão segura)
-- Estratégia:
-- 1. Para solutions SEM template: converte o mais recente
-- 2. Para solutions COM template: apenas limpa duplicatas

-- Passo 1: Criar templates para solutions que ainda não têm
WITH solutions_sem_template AS (
  SELECT DISTINCT solution_id
  FROM unified_checklists
  WHERE checklist_type = 'implementation'
  AND solution_id IS NOT NULL
  AND solution_id NOT IN (
    SELECT solution_id
    FROM unified_checklists
    WHERE checklist_type = 'implementation'
    AND is_template = true
    AND solution_id IS NOT NULL
  )
),
checklist_mais_recente AS (
  SELECT DISTINCT ON (uc.solution_id) uc.id
  FROM unified_checklists uc
  INNER JOIN solutions_sem_template sst ON sst.solution_id = uc.solution_id
  WHERE uc.checklist_type = 'implementation'
  AND uc.is_template = false
  ORDER BY uc.solution_id, uc.created_at DESC
)
UPDATE unified_checklists
SET is_template = true, updated_at = now()
WHERE id IN (SELECT id FROM checklist_mais_recente);

-- Passo 2: Remover TODOS os checklists duplicados (is_template = false)
-- Agora todas as solutions têm template
DELETE FROM unified_checklists
WHERE checklist_type = 'implementation'
AND is_template = false
AND solution_id IS NOT NULL;