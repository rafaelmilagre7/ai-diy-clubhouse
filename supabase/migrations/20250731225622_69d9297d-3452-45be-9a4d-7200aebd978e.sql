-- Remover templates automáticos criados pelas migrações anteriores
DELETE FROM unified_checklists 
WHERE is_template = true 
AND created_at >= '2025-01-30'::date
AND checklist_data->>'auto_generated' = 'true';

-- Remover qualquer template que tenha sido criado automaticamente
DELETE FROM unified_checklists 
WHERE is_template = true 
AND (
  checklist_data->'items'->0->>'title' = 'Análise de Requisitos' 
  OR checklist_data->'items'->0->>'title' = 'Planejamento'
  OR checklist_data->>'source' = 'auto_migration'
);