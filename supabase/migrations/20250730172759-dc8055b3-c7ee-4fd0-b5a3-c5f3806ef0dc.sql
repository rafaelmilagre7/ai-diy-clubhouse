-- Criar registro de onboarding para usuário que não tem
INSERT INTO quick_onboarding (
  user_id,
  email,
  name,
  current_step,
  is_completed,
  created_at,
  updated_at
) 
SELECT 
  p.id,
  p.email,
  p.name,
  1,
  false,
  now(),
  now()
FROM profiles p
WHERE p.email = 'lis-rios@tuamaeaquelaursa.com'
  AND NOT EXISTS (
    SELECT 1 FROM quick_onboarding qo 
    WHERE qo.user_id = p.id
  );