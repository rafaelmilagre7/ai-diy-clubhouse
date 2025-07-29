-- Migração simples e direta dos dados legados
-- Primeiro migrar implementation_checkpoints

WITH migrated_checkpoints AS (
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
    'implementation'::text,
    CASE 
      WHEN ic.checkpoint_data IS NOT NULL THEN ic.checkpoint_data
      ELSE jsonb_build_object('items', '[]'::jsonb, 'lastUpdated', now()::text)
    END,
    COALESCE(array_length(ic.completed_steps, 1), 0),
    COALESCE(ic.total_steps, 0),
    COALESCE(ic.progress_percentage, 0),
    CASE WHEN COALESCE(ic.progress_percentage, 0) = 100 THEN true ELSE false END,
    COALESCE(ic.is_template, false),
    ic.created_at,
    ic.updated_at,
    jsonb_build_object(
      'migrated_from', 'implementation_checkpoints',
      'original_id', ic.id::text
    )
  FROM implementation_checkpoints ic
  WHERE NOT EXISTS (
    SELECT 1 FROM unified_checklists uc 
    WHERE uc.user_id = ic.user_id 
    AND uc.solution_id = ic.solution_id 
    AND uc.checklist_type = 'implementation'
    AND uc.is_template = COALESCE(ic.is_template, false)
  )
  RETURNING id
)
SELECT COUNT(*) as migrated_checkpoints FROM migrated_checkpoints;