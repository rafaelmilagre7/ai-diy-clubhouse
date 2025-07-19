
-- 1. Remover colunas de onboarding da tabela profiles
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS onboarding_completed CASCADE,
DROP COLUMN IF EXISTS onboarding_completed_at CASCADE,
DROP COLUMN IF EXISTS onboarding_step CASCADE;

-- 2. Remover todas as tabelas de onboarding
DROP TABLE IF EXISTS public.onboarding_final CASCADE;
DROP TABLE IF EXISTS public.onboarding_integrity_checks CASCADE;
DROP TABLE IF EXISTS public.quick_onboarding CASCADE;
DROP TABLE IF EXISTS public.onboarding_backups CASCADE;
DROP TABLE IF EXISTS public.onboarding_sync CASCADE;
DROP TABLE IF EXISTS public.onboarding_step_tracking CASCADE;
DROP TABLE IF EXISTS public.onboarding_abandonment_points CASCADE;

-- 3. Remover funções relacionadas ao onboarding (se existirem)
DROP FUNCTION IF EXISTS public.complete_onboarding(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.initialize_onboarding_after_invite() CASCADE;
DROP FUNCTION IF EXISTS public.sync_onboarding_final_to_profile() CASCADE;
DROP FUNCTION IF EXISTS public.update_onboarding_final_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.complete_onboarding_and_unlock_features(uuid, jsonb) CASCADE;

-- 4. Remover triggers relacionados ao onboarding (se existirem)
DROP TRIGGER IF EXISTS trigger_initialize_onboarding_after_invite ON public.profiles;
DROP TRIGGER IF EXISTS sync_onboarding_final_to_profile ON public.onboarding_final;
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

-- 5. Verificar limpeza
SELECT 'Limpeza concluída! Tabelas de onboarding removidas do banco.' as status;
