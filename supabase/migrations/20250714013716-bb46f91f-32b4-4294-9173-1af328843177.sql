-- 1. Remover trigger conflitante existente
DROP TRIGGER IF EXISTS update_profiles_from_onboarding ON public.onboarding;
DROP FUNCTION IF EXISTS sync_onboarding_to_profile();

-- 2. Corrigir usuário atual: marcar onboarding como completo
UPDATE public.onboarding 
SET is_completed = true, 
    completed_at = now()
WHERE user_id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND is_completed = false;

-- 3. Sincronizar profile do usuário atual
UPDATE public.profiles 
SET onboarding_completed = true,
    onboarding_completed_at = now()
WHERE id = 'dc418224-acd7-4f5f-9a7e-e1c981b78fb6' 
  AND onboarding_completed = false;