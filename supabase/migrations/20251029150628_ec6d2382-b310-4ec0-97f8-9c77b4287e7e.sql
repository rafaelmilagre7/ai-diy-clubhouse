-- Desabilitar trigger problemático temporariamente
ALTER TABLE onboarding_final DISABLE TRIGGER onboarding_strategic_data_sync;

-- Liberar os 15 usuários presos manualmente
UPDATE onboarding_final
SET 
  is_completed = true,
  completed_at = COALESCE(completed_at, NOW()),
  current_step = 6,
  status = 'completed',
  updated_at = NOW()
WHERE 
  is_completed = false
  AND array_length(completed_steps, 1) >= 6;

UPDATE profiles p
SET onboarding_completed = true, updated_at = NOW()
FROM onboarding_final of
WHERE p.id = of.user_id
  AND of.is_completed = true
  AND COALESCE(p.onboarding_completed, false) = false;

-- Reabilitar trigger
ALTER TABLE onboarding_final ENABLE TRIGGER onboarding_strategic_data_sync;