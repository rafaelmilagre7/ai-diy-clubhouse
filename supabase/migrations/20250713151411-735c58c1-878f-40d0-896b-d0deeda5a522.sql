-- 1. Limpar políticas RLS duplicadas
DROP POLICY IF EXISTS "Users can view their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can view their own onboarding data" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update their own onboarding" ON public.onboarding_final;
DROP POLICY IF EXISTS "Users can update their own onboarding data" ON public.onboarding_final;

-- 2. Criar políticas RLS limpas e organizadas
CREATE POLICY "onboarding_final_select_policy" ON public.onboarding_final
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "onboarding_final_insert_policy" ON public.onboarding_final
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "onboarding_final_update_policy" ON public.onboarding_final
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Recriar o trigger do updated_at
DROP TRIGGER IF EXISTS update_onboarding_final_updated_at ON public.onboarding_final;

CREATE TRIGGER update_onboarding_final_updated_at
  BEFORE UPDATE ON public.onboarding_final
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_final_updated_at();

-- 4. Verificar se tudo foi criado corretamente
SELECT 'Políticas criadas:' as status;
SELECT policyname FROM pg_policies WHERE tablename = 'onboarding_final';

SELECT 'Trigger criado:' as status;
SELECT tgname FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'onboarding_final' AND tgname = 'update_onboarding_final_updated_at';