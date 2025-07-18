
-- ETAPA 2: LIMPEZA DE POLÍTICAS RLS CONFLITANTES NAS TABELAS DE LEARNING
-- Remover políticas duplicadas e conflitantes em learning_modules e learning_lessons

-- 1. LIMPAR POLÍTICAS CONFLITANTES EM LEARNING_MODULES
DROP POLICY IF EXISTS "learning_modules_secure_select_policy" ON public.learning_modules;
DROP POLICY IF EXISTS "Admins can manage all modules" ON public.learning_modules;
DROP POLICY IF EXISTS "Users can view published modules" ON public.learning_modules;

-- Criar política única e funcional para módulos
CREATE POLICY "learning_modules_unified_access" ON public.learning_modules
FOR SELECT USING (
  published = true OR 
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  )
);

-- 2. LIMPAR POLÍTICAS CONFLITANTES EM LEARNING_LESSONS
DROP POLICY IF EXISTS "learning_lessons_secure_select_policy" ON public.learning_lessons;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON public.learning_lessons;
DROP POLICY IF EXISTS "Users can view published lessons" ON public.learning_lessons;

-- Criar política única e funcional para aulas
CREATE POLICY "learning_lessons_unified_access" ON public.learning_lessons
FOR SELECT USING (
  published = true OR 
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles p
      INNER JOIN public.user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.name = 'admin'
    )
  )
);

-- 3. VERIFICAR E CORRIGIR POLÍTICA EM LEARNING_LESSON_VIDEOS
DROP POLICY IF EXISTS "learning_lesson_videos_secure_select" ON public.learning_lesson_videos;

CREATE POLICY "learning_lesson_videos_access" ON public.learning_lesson_videos
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.learning_lessons ll
      WHERE ll.id = lesson_id AND (
        ll.published = true OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          INNER JOIN public.user_roles ur ON p.role_id = ur.id
          WHERE p.id = auth.uid() AND ur.name = 'admin'
        )
      )
    )
  )
);

-- 4. LOG DA LIMPEZA
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'rls_cleanup',
  'clean_learning_conflicting_policies',
  jsonb_build_object(
    'message', 'ETAPA 2 - Limpeza de políticas RLS conflitantes em learning',
    'tables_cleaned', ARRAY[
      'learning_modules', 
      'learning_lessons', 
      'learning_lesson_videos'
    ],
    'policies_unified', 'Single policy per table for better performance',
    'admin_access', 'Full admin access guaranteed',
    'expected_result', 'Course lessons should now be visible in accordion'
  ),
  'critical'
);
