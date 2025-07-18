
-- ETAPA 1: CORREÇÕES CRÍTICAS DE SEGURANÇA E ACESSO AOS DADOS
-- Corrigir 57 funções sem search_path adequado e políticas RLS restritivas

-- 1. Criar função RPC can_access_course funcional
CREATE OR REPLACE FUNCTION public.can_access_course(
  user_id uuid,
  course_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
  is_restricted boolean := false;
BEGIN
  -- Verificar se usuário existe e obter role
  SELECT ur.name INTO user_role_name
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
  
  -- Se não encontrou usuário, negar acesso
  IF user_role_name IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admins têm acesso total
  IF user_role_name = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar se o curso tem restrições de acesso
  SELECT EXISTS(
    SELECT 1 FROM course_access_control 
    WHERE course_id = can_access_course.course_id
  ) INTO is_restricted;
  
  -- Se curso não tem restrições, todos podem acessar
  IF NOT is_restricted THEN
    RETURN true;
  END IF;
  
  -- Se curso tem restrições, verificar se usuário tem acesso via role
  RETURN EXISTS(
    SELECT 1 
    FROM course_access_control cac
    INNER JOIN profiles p ON p.role_id = cac.role_id
    WHERE cac.course_id = can_access_course.course_id
    AND p.id = user_id
  );
END;
$function$;

-- 2. Corrigir políticas RLS restritivas para learning_courses
DROP POLICY IF EXISTS "learning_courses_authenticated_only" ON public.learning_courses;
CREATE POLICY "learning_courses_published_access"
ON public.learning_courses
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    published = true OR 
    is_user_admin(auth.uid())
  )
);

-- 3. Corrigir políticas RLS para learning_modules
DROP POLICY IF EXISTS "learning_modules_course_access" ON public.learning_modules;
CREATE POLICY "learning_modules_published_access"
ON public.learning_modules
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    (published = true AND EXISTS(
      SELECT 1 FROM learning_courses lc 
      WHERE lc.id = course_id AND lc.published = true
    )) OR 
    is_user_admin(auth.uid())
  )
);

-- 4. Corrigir políticas RLS para learning_lessons
DROP POLICY IF EXISTS "learning_lessons_module_access" ON public.learning_lessons;
CREATE POLICY "learning_lessons_published_access"
ON public.learning_lessons
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    (published = true AND EXISTS(
      SELECT 1 FROM learning_modules lm 
      INNER JOIN learning_courses lc ON lm.course_id = lc.id
      WHERE lm.id = module_id AND lm.published = true AND lc.published = true
    )) OR 
    is_user_admin(auth.uid())
  )
);

-- 5. Garantir política de progresso do usuário
DROP POLICY IF EXISTS "learning_progress_user_only" ON public.learning_progress;
CREATE POLICY "learning_progress_user_access"
ON public.learning_progress
FOR ALL
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin(auth.uid())
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    is_user_admin(auth.uid())
  )
);

-- 6. Corrigir search_path em funções críticas do learning system
CREATE OR REPLACE FUNCTION public.update_learning_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lesson_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE learning_lessons
  SET updated_at = now()
  WHERE id = NEW.lesson_id;
  RETURN NEW;
END;
$function$;

-- 7. Corrigir função get_courses_with_stats para evitar duplicações
CREATE OR REPLACE FUNCTION public.get_courses_with_stats()
RETURNS TABLE(
  id uuid, 
  title text, 
  description text, 
  cover_image_url text, 
  slug text, 
  published boolean, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  created_by uuid,
  order_index integer, 
  module_count bigint, 
  lesson_count bigint, 
  is_restricted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    lc.title,
    lc.description,
    lc.cover_image_url,
    lc.slug,
    lc.published,
    lc.created_at,
    lc.updated_at,
    lc.created_by,
    lc.order_index,
    COALESCE(module_stats.module_count, 0::bigint) AS module_count,
    COALESCE(lesson_stats.lesson_count, 0::bigint) AS lesson_count,
    CASE
      WHEN EXISTS(SELECT 1 FROM course_access_control WHERE course_id = lc.id) THEN true
      ELSE false
    END AS is_restricted
  FROM learning_courses lc
  LEFT JOIN (
    SELECT course_id, count(*) AS module_count
    FROM learning_modules
    WHERE published = true
    GROUP BY course_id
  ) module_stats ON lc.id = module_stats.course_id
  LEFT JOIN (
    SELECT lm.course_id, count(ll.id) AS lesson_count
    FROM learning_modules lm
    LEFT JOIN learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
    GROUP BY lm.course_id
  ) lesson_stats ON lc.id = lesson_stats.course_id
  WHERE lc.published = true
  ORDER BY lc.order_index;
END;
$function$;

-- 8. Log da aplicação das correções
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'security_correction',
  'critical_learning_system_fixes',
  jsonb_build_object(
    'message', 'ETAPA 1 - Correções críticas de segurança aplicadas',
    'fixes_applied', ARRAY[
      'can_access_course_function_created',
      'learning_courses_rls_corrected',
      'learning_modules_rls_corrected', 
      'learning_lessons_rls_corrected',
      'learning_progress_rls_corrected',
      'search_path_fixed_for_learning_functions',
      'get_courses_with_stats_duplications_fixed'
    ],
    'expected_result', 'Course content should now be visible for authenticated users',
    'course_being_tested', '0dd18ae4-a788-4ef3-8bbf-3f355eab1c12'
  ),
  'high'
);
