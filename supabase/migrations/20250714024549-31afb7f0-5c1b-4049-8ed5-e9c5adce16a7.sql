-- Remover triggers problemáticos específicos
DROP TRIGGER IF EXISTS update_onboarding_updated_at ON public.onboarding;
DROP TRIGGER IF EXISTS sync_onboarding_to_profile_trigger ON public.onboarding;

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

-- Recriar o trigger correto
CREATE TRIGGER sync_onboarding_to_profile_trigger
  AFTER UPDATE ON public.onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_onboarding_to_profile();