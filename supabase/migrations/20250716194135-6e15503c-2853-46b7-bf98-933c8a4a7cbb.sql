-- FASE 1: Correção Crítica de RLS - Eliminar Recursão Infinita

-- 1. Corrigir política recursiva em learning_courses
DROP POLICY IF EXISTS "learning_courses_select_policy" ON public.learning_courses;
DROP POLICY IF EXISTS "learning_courses_admin_policy" ON public.learning_courses;

-- Criar política simples para learning_courses
CREATE POLICY "learning_courses_public_select" 
ON public.learning_courses 
FOR SELECT 
USING (published = true OR is_user_admin(auth.uid()));

CREATE POLICY "learning_courses_admin_all" 
ON public.learning_courses 
FOR ALL 
USING (is_user_admin(auth.uid()));

-- 2. Corrigir funções com search_path inseguro
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.name = 'admin'
  );
END;
$$;

-- 3. Remover views Security Definer problemáticas e recriar como funções seguras
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.user_engagement_score CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;

-- Recriar como função segura para learning_courses_with_stats
CREATE OR REPLACE FUNCTION public.get_learning_courses_with_stats()
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  slug text,
  cover_image_url text,
  published boolean,
  order_index integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid,
  total_modules bigint,
  total_lessons bigint,
  enrolled_users bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    lc.title,
    lc.description,
    lc.slug,
    lc.cover_image_url,
    lc.published,
    lc.order_index,
    lc.created_at,
    lc.updated_at,
    lc.created_by,
    COUNT(DISTINCT lm.id) as total_modules,
    COUNT(DISTINCT ll.id) as total_lessons,
    COUNT(DISTINCT lp.user_id) as enrolled_users
  FROM public.learning_courses lc
  LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id
  LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE lc.published = true OR public.is_user_admin(auth.uid())
  GROUP BY lc.id, lc.title, lc.description, lc.slug, lc.cover_image_url, 
           lc.published, lc.order_index, lc.created_at, lc.updated_at, lc.created_by;
END;
$$;

-- 4. Limpar políticas problemáticas em outras tabelas
DROP POLICY IF EXISTS "Users can view their learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users can manage their learning progress" ON public.learning_progress;

-- Recriar políticas simples para learning_progress
CREATE POLICY "learning_progress_user_access" 
ON public.learning_progress 
FOR ALL 
USING (user_id = auth.uid() OR is_user_admin(auth.uid()));

-- 5. Corrigir política em profiles que está causando recursão
DROP POLICY IF EXISTS "secure_profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_secure_select" 
ON public.profiles 
FOR SELECT 
USING (
  id = auth.uid() OR 
  is_user_admin(auth.uid())
);

-- 6. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'rls_recursion_fix',
  '{"message": "Corrigidas políticas RLS recursivas e views problemáticas", "phase": "1_critical_rls_fix", "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);