-- ============================================================================
-- CORREÇÃO DE PERMISSÕES - SISTEMA DE APRENDIZADO
-- ============================================================================
-- Fix para erro: 42P01: relation "learning_lessons" does not exist
-- Causa: Roles anon/authenticated sem permissão SELECT nas tabelas de learning
-- Solução: GRANT SELECT mantendo RLS ativo para controle de acesso
-- ============================================================================

-- 1. GRANT SELECT nas tabelas principais de aprendizado
-- Permite validação de Foreign Keys e leitura controlada por RLS

GRANT SELECT ON public.learning_courses TO anon, authenticated;
GRANT SELECT ON public.learning_modules TO anon, authenticated;
GRANT SELECT ON public.learning_lessons TO anon, authenticated;
GRANT SELECT ON public.learning_lesson_videos TO anon, authenticated;
GRANT SELECT ON public.learning_resources TO anon, authenticated;
GRANT SELECT ON public.learning_lesson_tools TO anon, authenticated;
GRANT SELECT ON public.learning_comments TO anon, authenticated;

-- 2. GRANT SELECT nas tabelas auxiliares
GRANT SELECT ON public.lesson_tags TO anon, authenticated;
GRANT SELECT ON public.learning_lesson_tags TO anon, authenticated;

-- 3. Verificar se RLS está habilitado (segurança mantida)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'learning_lessons'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS está habilitado em learning_lessons - segurança mantida';
  ELSE
    RAISE WARNING '⚠️  AVISO: RLS não está habilitado em learning_lessons';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'learning_modules'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS está habilitado em learning_modules - segurança mantida';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'learning_courses'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS está habilitado em learning_courses - segurança mantida';
  END IF;
END $$;

-- 4. Documentação
COMMENT ON TABLE public.learning_lessons IS 
  'Tabela de aulas. SELECT permitido para anon/authenticated para validação de FK. Acesso controlado por RLS policies.';

COMMENT ON TABLE public.learning_modules IS 
  'Tabela de módulos. SELECT permitido para anon/authenticated para validação de FK. Acesso controlado por RLS policies.';

COMMENT ON TABLE public.learning_courses IS 
  'Tabela de cursos. SELECT permitido para anon/authenticated para validação de FK. Acesso controlado por RLS policies.';

-- 5. Verificação final de permissões
DO $$
DECLARE
  missing_perms TEXT[];
BEGIN
  -- Verificar se todas as permissões necessárias foram concedidas
  SELECT ARRAY_AGG(tablename) INTO missing_perms
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('learning_courses', 'learning_modules', 'learning_lessons', 'learning_lesson_videos', 'learning_resources')
  AND NOT has_table_privilege('authenticated', schemaname||'.'||tablename, 'SELECT');
  
  IF missing_perms IS NOT NULL THEN
    RAISE WARNING '⚠️  Tabelas sem permissão SELECT para authenticated: %', missing_perms;
  ELSE
    RAISE NOTICE '✅ Todas as permissões SELECT foram concedidas corretamente';
  END IF;
END $$;