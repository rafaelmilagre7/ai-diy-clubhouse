-- Migração corrigida - consolidação do sistema de checklists
-- 1. Migrar todos os dados de implementation_checkpoints para unified_checklists

INSERT INTO unified_checklists (
  user_id,
  solution_id,
  template_id,
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
  ic.user_id,
  ic.solution_id,
  ic.template_id,
  'implementation'::text as checklist_type,
  CASE 
    WHEN ic.checkpoint_data IS NOT NULL THEN ic.checkpoint_data
    ELSE '{"items": [], "lastUpdated": "' || now()::text || '"}'::jsonb
  END as checklist_data,
  COALESCE(array_length(ic.completed_steps, 1), 0) as completed_items,
  COALESCE(ic.total_steps, 0) as total_items,
  COALESCE(ic.progress_percentage, 0) as progress_percentage,
  CASE WHEN ic.progress_percentage = 100 THEN true ELSE false END as is_completed,
  COALESCE(ic.is_template, false) as is_template,
  ic.created_at,
  ic.updated_at,
  jsonb_build_object(
    'migrated_from', 'implementation_checkpoints',
    'original_id', ic.id,
    'last_completed_step', ic.last_completed_step
  ) as metadata
FROM implementation_checkpoints ic
WHERE NOT EXISTS (
  SELECT 1 FROM unified_checklists uc 
  WHERE uc.user_id = ic.user_id 
  AND uc.solution_id = ic.solution_id 
  AND uc.checklist_type = 'implementation'
  AND uc.is_template = COALESCE(ic.is_template, false)
);

-- 2. Migrar dados de user_checklists para unified_checklists
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
  uc.user_id,
  uc.solution_id,
  'user'::text as checklist_type,
  CASE 
    WHEN uc.checklist_data IS NOT NULL AND jsonb_typeof(uc.checklist_data) = 'object' THEN
      jsonb_build_object(
        'items', COALESCE(uc.checklist_data->'items', '[]'::jsonb),
        'lastUpdated', COALESCE(uc.checklist_data->>'lastUpdated', now()::text)
      )
    ELSE 
      '{"items": [], "lastUpdated": "' || now()::text || '"}'::jsonb
  END as checklist_data,
  CASE 
    WHEN uc.checklist_data->'items' IS NOT NULL THEN
      (SELECT COUNT(*) FROM jsonb_array_elements(uc.checklist_data->'items') WHERE (value->>'completed')::boolean = true)
    ELSE 0
  END as completed_items,
  CASE 
    WHEN uc.checklist_data->'items' IS NOT NULL THEN
      jsonb_array_length(uc.checklist_data->'items')
    ELSE 0
  END as total_items,
  CASE 
    WHEN uc.checklist_data->'items' IS NOT NULL AND jsonb_array_length(uc.checklist_data->'items') > 0 THEN
      ROUND(((SELECT COUNT(*) FROM jsonb_array_elements(uc.checklist_data->'items') WHERE (value->>'completed')::boolean = true)::numeric / 
             jsonb_array_length(uc.checklist_data->'items')::numeric) * 100)
    ELSE 0
  END as progress_percentage,
  CASE 
    WHEN uc.checklist_data->'items' IS NOT NULL AND jsonb_array_length(uc.checklist_data->'items') > 0 THEN
      (SELECT COUNT(*) = jsonb_array_length(uc.checklist_data->'items') 
       FROM jsonb_array_elements(uc.checklist_data->'items') 
       WHERE (value->>'completed')::boolean = true)
    ELSE false
  END as is_completed,
  false as is_template,
  uc.created_at,
  uc.updated_at,
  jsonb_build_object(
    'migrated_from', 'user_checklists',
    'original_id', uc.id
  ) as metadata
FROM user_checklists uc
WHERE NOT EXISTS (
  SELECT 1 FROM unified_checklists unif 
  WHERE unif.user_id = uc.user_id 
  AND unif.solution_id = uc.solution_id 
  AND unif.checklist_type = 'user'
  AND unif.is_template = false
);