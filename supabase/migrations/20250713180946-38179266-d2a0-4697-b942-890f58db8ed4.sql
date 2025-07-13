-- Resolver conflito entre sistemas de onboarding
-- Remover triggers conflitantes da tabela user_onboarding

-- 1. Remover ALL triggers problemáticos que estão causando conflito
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at_trigger ON public.user_onboarding;
DROP TRIGGER IF EXISTS sync_onboarding_to_profile ON public.user_onboarding;

-- 2. Remover função de trigger com CASCADE
DROP FUNCTION IF EXISTS public.update_user_onboarding_updated_at() CASCADE;

-- 3. Agora o sistema usará apenas onboarding_final 
-- (já tem o trigger sync_onboarding_final_to_profile funcionando corretamente)