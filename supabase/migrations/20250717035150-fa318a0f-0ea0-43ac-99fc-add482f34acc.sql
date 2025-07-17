-- Marcar todos os usuários existentes como tendo completado o onboarding
UPDATE public.profiles 
SET 
    onboarding_completed = true,
    onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
    updated_at = now()
WHERE onboarding_completed = false OR onboarding_completed IS NULL;