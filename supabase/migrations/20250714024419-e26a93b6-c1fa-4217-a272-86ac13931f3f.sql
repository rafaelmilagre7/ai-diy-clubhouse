-- Desabilitar temporariamente os triggers problemáticos
ALTER TABLE public.onboarding DISABLE TRIGGER ALL;
ALTER TABLE public.profiles DISABLE TRIGGER ALL;

-- Corrigir estado inconsistente do onboarding para usuários que já completaram todas as etapas
UPDATE public.onboarding 
SET is_completed = true
WHERE current_step = 7 
  AND completed_steps @> ARRAY[1,2,3,4,5,6]
  AND is_completed = false;

-- Sincronizar com a tabela profiles
UPDATE public.profiles 
SET 
  onboarding_completed = true,
  onboarding_completed_at = now()
WHERE id IN (
  SELECT user_id 
  FROM public.onboarding 
  WHERE is_completed = true 
    AND current_step = 7
)
AND onboarding_completed = false;

-- Reabilitar os triggers
ALTER TABLE public.onboarding ENABLE TRIGGER ALL;
ALTER TABLE public.profiles ENABLE TRIGGER ALL;