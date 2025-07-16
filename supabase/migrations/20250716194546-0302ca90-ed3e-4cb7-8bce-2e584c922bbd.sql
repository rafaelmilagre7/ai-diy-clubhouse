-- FASE 1: Correção Simplificada - Apenas corrigir function e views problemáticas

-- 1. Verificar se is_user_admin ainda precisa ser recriada (pode ter sido feita pelo CASCADE)
-- Se não foi, criar uma nova versão com nome diferente
CREATE OR REPLACE FUNCTION public.is_admin_safe()
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
    WHERE p.id = auth.uid() AND ur.name = 'admin'
  );
END;
$$;

-- 2. Remover views Security Definer problemáticas que causam recursão
DROP VIEW IF EXISTS public.learning_courses_with_stats CASCADE;
DROP VIEW IF EXISTS public.learning_lessons_with_relations CASCADE;
DROP VIEW IF EXISTS public.user_engagement_score CASCADE;
DROP VIEW IF EXISTS public.users_with_roles CASCADE;

-- 3. Criar função segura para substituir learning_courses_with_stats
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
  WHERE lc.published = true OR public.is_admin_safe()
  GROUP BY lc.id, lc.title, lc.description, lc.slug, lc.cover_image_url, 
           lc.published, lc.order_index, lc.created_at, lc.updated_at, lc.created_by;
END;
$$;

-- 4. Log da correção FASE 1
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'system_cleanup',
  'phase_1_rls_stabilization',
  '{"message": "FASE 1 - Views recursivas removidas, função admin segura criada", "phase": "1_complete", "next": "phase_2_onboarding_simplification", "timestamp": "' || now() || '"}'::jsonb,
  auth.uid()
);