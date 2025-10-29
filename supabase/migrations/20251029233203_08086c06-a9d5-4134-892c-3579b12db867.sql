-- ============================================================================
-- CORREÇÃO FINAL: Learning Progress Policy
-- Problema: Múltiplas versões da policy causando conflito
-- Solução: Limpar TUDO e recriar de forma definitiva
-- ============================================================================

-- 1. DELETAR TODAS as policies de learning_progress (limpeza total)
DO $$ 
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'learning_progress'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.learning_progress', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- 2. RECRIAR policy única e definitiva
CREATE POLICY "learning_progress_access_final"
ON public.learning_progress
FOR ALL
TO authenticated
USING (
  -- Usuário acessa apenas seu próprio progresso OU é admin
  user_id = auth.uid() 
  OR 
  is_user_admin_secure(auth.uid())
)
WITH CHECK (
  -- Mesma regra para INSERT/UPDATE
  user_id = auth.uid() 
  OR 
  is_user_admin_secure(auth.uid())
);

COMMENT ON POLICY "learning_progress_access_final" ON public.learning_progress IS 
  'Policy definitiva pós-refatoração 2025-10-29: 
   - Usuário gerencia apenas seu próprio progresso
   - Admin pode gerenciar todo progresso
   - Simplificada ao máximo para evitar conflitos de FK validation';

-- 3. Verificar se a policy foi criada corretamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'learning_progress'
      AND policyname = 'learning_progress_access_final'
  ) THEN
    RAISE EXCEPTION 'ERRO: Policy learning_progress_access_final não foi criada!';
  END IF;
  
  RAISE NOTICE '✅ Policy learning_progress_access_final criada com sucesso!';
END $$;

-- 4. Forçar reload do PostgREST (2x para garantir)
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload config');
NOTIFY pgrst, 'reload schema';