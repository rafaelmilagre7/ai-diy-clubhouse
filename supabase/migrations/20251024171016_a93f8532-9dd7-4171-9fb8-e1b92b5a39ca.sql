-- Fase 3: Migração de dados existentes
-- Marcar todos os checklists de implementação como templates

UPDATE unified_checklists
SET 
  is_template = true,
  updated_at = now()
WHERE checklist_type = 'implementation'
  AND is_template = false
  AND user_id IS NOT NULL
  AND checklist_data IS NOT NULL;