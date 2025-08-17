-- Atualizar função para considerar controle de acesso por roles
CREATE OR REPLACE FUNCTION public.get_learning_courses_with_stats()
 RETURNS TABLE(id uuid, title text, description text, slug text, cover_image_url text, published boolean, order_index integer, created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid, total_modules bigint, total_lessons bigint, enrolled_users bigint, is_restricted boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_user_role_id uuid;
BEGIN
  -- Obter role_id do usuário atual
  SELECT p.role_id INTO current_user_role_id
  FROM public.profiles p
  WHERE p.id = auth.uid();
  
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
    COUNT(DISTINCT lp.user_id) as enrolled_users,
    -- Verificar se o curso tem restrições
    (EXISTS (SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id)) as is_restricted
  FROM public.learning_courses lc
  LEFT JOIN public.learning_modules lm ON lc.id = lm.course_id AND lm.published = true
  LEFT JOIN public.learning_lessons ll ON lm.id = ll.module_id AND ll.published = true  
  LEFT JOIN public.learning_progress lp ON ll.id = lp.lesson_id
  WHERE 
    (lc.published = true OR public.is_admin_safe())
    AND (
      -- Mostrar se não tem restrições
      NOT EXISTS (SELECT 1 FROM public.course_access_control cac WHERE cac.course_id = lc.id)
      OR
      -- Mostrar se é admin
      public.is_admin_safe()
      OR  
      -- Mostrar se o usuário tem o role necessário para o curso
      (current_user_role_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.course_access_control cac 
        WHERE cac.course_id = lc.id AND cac.role_id = current_user_role_id
      ))
    )
  GROUP BY lc.id, lc.title, lc.description, lc.slug, lc.cover_image_url, 
           lc.published, lc.order_index, lc.created_at, lc.updated_at, lc.created_by
  ORDER BY lc.order_index;
END;
$function$