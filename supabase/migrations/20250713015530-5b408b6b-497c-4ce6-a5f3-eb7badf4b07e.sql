-- Corrigir a função get_courses_with_stats para evitar duplicações
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
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
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
    -- Corrigir o problema de duplicação: usar EXISTS ao invés de JOIN
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
$function$;