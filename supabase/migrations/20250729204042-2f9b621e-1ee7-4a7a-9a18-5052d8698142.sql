-- Converter checklist existente da solução em template oficial
-- Primeiro, criar o template baseado nos dados existentes
INSERT INTO unified_checklists (
  user_id,
  solution_id,
  checklist_type,
  checklist_data,
  completed_items,
  total_items,
  progress_percentage,
  is_completed,
  is_template,
  created_at,
  updated_at,
  metadata
)
SELECT 
  user_id, -- Manter o criador original para auditoria
  solution_id,
  checklist_type,
  checklist_data,
  0 as completed_items, -- Template inicia zerado
  total_items,
  0 as progress_percentage, -- Template inicia zerado
  false as is_completed, -- Template nunca está completo
  true as is_template, -- ESTE É O TEMPLATE
  created_at,
  now() as updated_at,
  jsonb_build_object(
    'converted_from_user_checklist', true,
    'original_checklist_id', id::text,
    'converted_at', now()::text
  ) as metadata
FROM unified_checklists 
WHERE solution_id = '46375086-10fe-431b-bcb5-67d6e5155bee'
  AND checklist_type = 'implementation'
  AND is_template = false
  AND NOT EXISTS (
    -- Só criar se não existir template já
    SELECT 1 FROM unified_checklists t 
    WHERE t.solution_id = '46375086-10fe-431b-bcb5-67d6e5155bee'
    AND t.checklist_type = 'implementation' 
    AND t.is_template = true
  )
LIMIT 1;