-- Corrigir o campo onboarding_completed para usuários que já completaram o onboarding
UPDATE profiles 
SET onboarding_completed = true,
    updated_at = now()
WHERE id IN (
  SELECT DISTINCT o.user_id 
  FROM onboarding_simple o 
  WHERE o.is_completed = true
  AND o.user_id IS NOT NULL
);