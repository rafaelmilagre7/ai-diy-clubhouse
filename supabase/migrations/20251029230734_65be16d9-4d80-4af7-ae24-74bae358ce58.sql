-- ============================================================================
-- CORREÇÃO DE EXPOSIÇÃO DAS TABELAS NO POSTGREST (SIMPLIFICADA)
-- ============================================================================
-- Fix para erro 404 Not Found em /rest/v1/learning_progress
-- ============================================================================

-- 1. RE-GRANT de todas as permissões para forçar refresh no PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Re-grant nas tabelas principais do sistema learning
GRANT SELECT, INSERT, UPDATE ON public.learning_progress TO anon, authenticated;
GRANT SELECT ON public.learning_courses TO anon, authenticated;
GRANT SELECT ON public.learning_modules TO anon, authenticated;
GRANT SELECT ON public.learning_lessons TO anon, authenticated;
GRANT SELECT ON public.learning_lesson_videos TO anon, authenticated;
GRANT SELECT ON public.learning_resources TO anon, authenticated;
GRANT SELECT ON public.learning_lesson_tools TO anon, authenticated;
GRANT SELECT, INSERT ON public.learning_comments TO anon, authenticated;
GRANT SELECT ON public.course_access_control TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;

-- 2. Garantir que as sequences estão acessíveis (para INSERT)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 3. Criar índices otimizados (apenas os que ainda não existem)
CREATE INDEX IF NOT EXISTS idx_learning_lessons_module 
  ON public.learning_lessons(module_id) WHERE module_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_learning_modules_course 
  ON public.learning_modules(course_id) WHERE course_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_course_access_control_role_course 
  ON public.course_access_control(role_id, course_id);

-- 4. Comentário na tabela principal
COMMENT ON TABLE public.learning_progress IS 
  'Tabela de progresso de aprendizado. CRUD permitido para authenticated. Acesso controlado por RLS.';

-- 5. NOTIFY PostgREST para recarregar o schema cache
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');