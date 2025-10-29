-- ============================================================
-- MIGRAÇÃO: Liberar usuários presos no onboarding (v2)
-- ============================================================

-- Desabilitar trigger temporariamente para evitar conflitos
ALTER TABLE onboarding_final DISABLE TRIGGER onboarding_strategic_data_sync;

-- 1. Liberar usuários que completaram todos os steps
UPDATE onboarding_final
SET 
  is_completed = true,
  completed_at = COALESCE(completed_at, NOW()),
  current_step = 6,
  status = 'completed',
  updated_at = NOW()
WHERE 
  is_completed = false
  AND (
    (completed_steps @> ARRAY[1,2,3,4,5,6])
    OR
    (6 = ANY(completed_steps))
    OR
    (current_step >= 6 AND updated_at < NOW() - INTERVAL '1 hour')
  );

-- 2. Sincronizar profiles manualmente
UPDATE public.profiles p
SET 
  onboarding_completed = true,
  updated_at = NOW()
FROM onboarding_final of
WHERE 
  p.id = of.user_id
  AND of.is_completed = true
  AND COALESCE(p.onboarding_completed, false) = false;

-- Reabilitar trigger
ALTER TABLE onboarding_final ENABLE TRIGGER onboarding_strategic_data_sync;