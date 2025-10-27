-- Marcar checklists administrativos existentes como templates
-- Isso corrige os 18 checklists criados manualmente que não tinham is_template = true

UPDATE public.unified_checklists 
SET is_template = true
WHERE solution_id IS NOT NULL 
  AND checklist_type = 'implementation'
  AND (is_template IS NULL OR is_template = false);

-- Log para confirmar quantos registros foram atualizados
DO $$
DECLARE
  updated_count integer;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE '✅ % checklists marcados como templates', updated_count;
END $$;