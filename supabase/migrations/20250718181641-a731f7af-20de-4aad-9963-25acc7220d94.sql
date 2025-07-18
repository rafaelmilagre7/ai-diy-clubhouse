
-- CORREÇÃO URGENTE - Função get_courses_with_stats com ambiguidade na coluna 'published'
-- Usar aliases explícitos para evitar conflitos

DROP FUNCTION IF EXISTS public.get_courses_with_stats();

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
    SELECT lm.course_id, count(*) AS module_count
    FROM learning_modules lm
    WHERE lm.published = true
    GROUP BY lm.course_id
  ) module_stats ON lc.id = module_stats.course_id
  LEFT JOIN (
    SELECT lm.course_id, count(ll.id) AS lesson_count
    FROM learning_modules lm
    LEFT JOIN learning_lessons ll ON lm.id = ll.module_id AND ll.published = true
    WHERE lm.published = true
    GROUP BY lm.course_id
  ) lesson_stats ON lc.id = lesson_stats.course_id
  WHERE lc.published = true
  ORDER BY lc.order_index;
END;
$function$;

-- Testar a função RPC can_access_benefit para ferramentas
CREATE OR REPLACE FUNCTION public.can_access_benefit(
  user_id uuid,
  tool_id uuid
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
  
  -- Verificar se a ferramenta tem restrições de acesso
  SELECT EXISTS(
    SELECT 1 FROM benefit_access_control 
    WHERE tool_id = can_access_benefit.tool_id
  ) INTO is_restricted;
  
  -- Se ferramenta não tem restrições, todos podem acessar
  IF NOT is_restricted THEN
    RETURN true;
  END IF;
  
  -- Se ferramenta tem restrições, verificar se usuário tem acesso via role
  RETURN EXISTS(
    SELECT 1 
    FROM benefit_access_control bac
    INNER JOIN profiles p ON p.role_id = bac.role_id
    WHERE bac.tool_id = can_access_benefit.tool_id
    AND p.id = user_id
  );
END;
$function$;

-- Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity
) VALUES (
  'urgent_fix',
  'fix_published_column_ambiguity',
  jsonb_build_object(
    'message', 'CORREÇÃO URGENTE - Ambiguidade na coluna published corrigida',
    'functions_fixed', ARRAY[
      'get_courses_with_stats',
      'can_access_benefit'
    ],
    'expected_result', 'Courses should now load with covers and content visible',
    'aliases_added', 'lm.published, ll.published, lc.published'
  ),
  'critical'
);
