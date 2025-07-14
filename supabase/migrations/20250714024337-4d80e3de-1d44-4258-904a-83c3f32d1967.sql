-- Corrigir estado inconsistente do onboarding para usuários que já completaram todas as etapas
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