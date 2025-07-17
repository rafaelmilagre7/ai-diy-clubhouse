-- Simples atualização sem triggers complexos
-- Primeiro verificar qual role padrão usar
WITH default_role AS (
  SELECT id as role_id 
  FROM public.user_roles 
  WHERE name IN ('member', 'membro', 'admin') 
  ORDER BY 
    CASE name 
      WHEN 'member' THEN 1 
      WHEN 'membro' THEN 2 
      WHEN 'admin' THEN 3 
      ELSE 4 
    END 
  LIMIT 1
)
UPDATE public.profiles 
SET 
  role_id = (SELECT role_id FROM default_role),
  onboarding_completed = true,
  onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
  updated_at = now()
WHERE 
  (role_id IS NULL OR onboarding_completed = false OR onboarding_completed IS NULL)
  AND EXISTS (SELECT 1 FROM default_role);