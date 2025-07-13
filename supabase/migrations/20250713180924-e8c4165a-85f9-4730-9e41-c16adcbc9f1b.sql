-- Resolver conflito entre sistemas de onboarding
-- Remover triggers conflitantes da tabela user_onboarding

-- 1. Remover triggers problemáticos que estão causando conflito
DROP TRIGGER IF EXISTS update_user_onboarding_updated_at ON public.user_onboarding;
DROP TRIGGER IF EXISTS sync_onboarding_to_profile ON public.user_onboarding;

-- 2. Remover função de trigger se existir
DROP FUNCTION IF EXISTS public.update_user_onboarding_updated_at();

-- 3. Garantir que apenas onboarding_final está sendo usado
-- (já tem o trigger sync_onboarding_final_to_profile funcionando corretamente)