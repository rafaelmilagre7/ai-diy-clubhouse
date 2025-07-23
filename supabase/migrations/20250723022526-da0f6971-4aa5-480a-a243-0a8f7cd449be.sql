-- Remover completamente sistema de onboarding
-- Remoção de funções relacionadas ao onboarding

-- 1. Remover funções de onboarding
DROP FUNCTION IF EXISTS public.get_onboarding_next_step(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_for_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_for_user(uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_after_invite() CASCADE;
DROP FUNCTION IF EXISTS public.sync_onboarding_final_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_onboarding_final_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding_and_unlock_features(uuid, jsonb) CASCADE;

-- 2. Remover triggers relacionados ao onboarding (se existirem)
DROP TRIGGER IF EXISTS trigger_initialize_onboarding_after_invite ON public.profiles;
DROP TRIGGER IF EXISTS sync_onboarding_final_to_profile ON public.onboarding_final;
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- 3. Remover RPC de rastreamento de onboarding (se existirem)
DROP FUNCTION IF EXISTS public.reset_onboarding_step(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.track_onboarding_step(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.update_onboarding_step(uuid, integer) CASCADE;

-- 4. Verificar limpeza
SELECT 'Sistema de onboarding completamente removido do banco de dados!' as status;