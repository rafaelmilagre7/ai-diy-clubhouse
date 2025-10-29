-- Limpar registros com dados auto-inicializados antigos
-- Resetar para Step 0 quando há apenas dados de controle

UPDATE onboarding_final
SET 
  personal_info = '{}'::jsonb,
  current_step = 0,
  completed_steps = ARRAY[]::integer[],
  status = 'in_progress'
WHERE 
  personal_info->>'auto_initialized' = 'true'
  AND is_completed = false
  AND (
    -- Contar apenas campos que não são de controle
    (SELECT COUNT(*) 
     FROM jsonb_object_keys(personal_info) AS key
     WHERE key NOT IN ('auto_initialized', 'initialized_at', 'email', 'name')
    ) = 0
  );

-- Log para verificação
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Resetados % registros com dados auto-inicializados', affected_count;
END $$;