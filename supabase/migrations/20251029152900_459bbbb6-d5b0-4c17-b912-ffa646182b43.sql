
-- Desabilitar trigger problemático temporariamente
ALTER TABLE onboarding_final DISABLE TRIGGER onboarding_strategic_data_sync;

-- Liberar usuários presos
UPDATE onboarding_final
SET 
  is_completed = true,
  completed_at = NOW(),
  updated_at = NOW()
WHERE user_id IN (
  SELECT p.id
  FROM profiles p
  JOIN onboarding_final o ON p.id = o.user_id
  WHERE p.onboarding_completed = false
    AND o.is_completed = false
    AND p.created_at < NOW() - INTERVAL '30 minutes'
);

UPDATE profiles
SET 
  onboarding_completed = true,
  updated_at = NOW()
WHERE id IN (
  SELECT p.id
  FROM profiles p
  JOIN onboarding_final o ON p.id = o.user_id
  WHERE o.is_completed = true
    AND p.onboarding_completed = false
);

-- Reabilitar trigger
ALTER TABLE onboarding_final ENABLE TRIGGER onboarding_strategic_data_sync;
