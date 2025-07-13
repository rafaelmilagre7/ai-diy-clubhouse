-- Limpar políticas RLS duplicadas que sobraram
DROP POLICY IF EXISTS "Users can insert their own onboarding data" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update their own onboarding final" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can view their own onboarding final" ON public.onboarding_final;

-- Verificar resultado final
SELECT 'Políticas finais:' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'onboarding_final' ORDER BY policyname;