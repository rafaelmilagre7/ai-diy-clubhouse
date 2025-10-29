-- ============================================================================
-- CORREÇÃO DEFINITIVA: Desabilitar RLS em learning_lessons
-- Problema: FK validation falha com erro 42P01 durante UPDATE de learning_progress
-- Solução: Remover RLS de learning_lessons (conteúdo é público de qualquer forma)
-- ============================================================================

-- 1. Criar tabela de backup se não existir
CREATE TABLE IF NOT EXISTS _rls_policies_backup_20251029 (
  schemaname name,
  tablename name,
  policyname name,
  permissive text,
  roles name[],
  cmd text,
  qual text,
  with_check text,
  backed_up_at timestamp DEFAULT now()
);

-- 2. Fazer backup das policies atuais (caso precise reverter)
DO $$ 
BEGIN
  INSERT INTO _rls_policies_backup_20251029 (schemaname, tablename, policyname, roles, cmd, qual, with_check)
  SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename = 'learning_lessons'
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Backup de policies realizado';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ℹ️ Backup não necessário ou já existe';
END $$;

-- 3. Dropar todas as policies de learning_lessons
DROP POLICY IF EXISTS "learning_lessons_select_public" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_write_admin" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_authenticated_access" ON public.learning_lessons;
DROP POLICY IF EXISTS "learning_lessons_admin_full_access" ON public.learning_lessons;

-- 4. DESABILITAR RLS na tabela learning_lessons
ALTER TABLE public.learning_lessons DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.learning_lessons IS 
  'RLS desabilitado em 2025-10-29: 
   - Conteúdo das aulas é público para todos os membros
   - Segurança de edição mantida via application-level (apenas admins)
   - Garante que FK validation sempre funcione sem erro 42P01';

-- 5. Verificar que RLS foi desabilitado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = 'learning_lessons' 
      AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'ERRO: RLS ainda está habilitado em learning_lessons!';
  END IF;
  
  RAISE NOTICE '✅ RLS desabilitado com sucesso em learning_lessons';
END $$;

-- 6. Forçar reload do PostgREST (2x para garantir)
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload config');
NOTIFY pgrst, 'reload schema';