-- Limpar políticas RLS duplicadas da tabela onboarding_final

-- Remover políticas duplicadas e desnecessárias
DROP POLICY IF EXISTS "Users can create their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_insert_policy" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_user_full_access" ON public.onboarding_final;
DROP POLICY IF EXISTS "onboarding_final_user_insert" ON public.onboarding_final;
DROP POLICY IF EXISTS "users_manage_own_onboarding" ON public.onboarding_final;

-- Manter apenas as políticas essenciais (que foram criadas recentemente)
-- "Users can view their own onboarding data"
-- "Users can insert their own onboarding data" 
-- "Users can update their own onboarding data"
-- "Admins can view all onboarding data"