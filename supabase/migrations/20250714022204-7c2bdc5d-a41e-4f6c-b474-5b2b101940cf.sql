-- Corrigir estado inconsistente do onboarding para usuários que já completaram todas as etapas
-- Primeiro, vamos corrigir apenas a tabela onboarding
UPDATE public.onboarding 
SET 
  is_completed = true
WHERE user_id IN (
  SELECT user_id 
  FROM public.onboarding 
  WHERE current_step = 7 
    AND completed_steps @> ARRAY[1,2,3,4,5,6]
    AND is_completed = false
);

-- Depois corrigir a tabela profiles (sem updated_at que não existe)
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = now()
WHERE id IN (
  SELECT user_id 
  FROM public.onboarding 
  WHERE current_step = 7 
    AND completed_steps @> ARRAY[1,2,3,4,5,6]
    AND is_completed = true
    AND user_id IS NOT NULL
)
AND onboarding_completed = false;