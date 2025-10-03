-- Atualizar função get_nps_analytics_data para incluir títulos de curso e módulo
CREATE OR REPLACE FUNCTION public.get_nps_analytics_data(
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  lesson_id uuid,
  lesson_title text,
  module_title text,
  course_title text,
  score integer,
  feedback text,
  created_at timestamp with time zone,
  response_code text,
  user_name text,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Verificar se é admin
  v_is_admin := is_user_admin_secure(auth.uid());
  
  RETURN QUERY
  SELECT 
    nps.id,
    nps.user_id,
    nps.lesson_id,
    COALESCE(ll.title, 'Aula sem título') AS lesson_title,
    COALESCE(lm.title, 'Módulo sem título') AS module_title,
    COALESCE(lc.title, 'Curso sem título') AS course_title,
    nps.score,
    nps.feedback,
    nps.created_at,
    nps.response_code,
    COALESCE(p.name, 'Usuário') AS user_name,
    COALESCE(p.email, '') AS user_email
  FROM public.learning_lesson_nps nps
  LEFT JOIN public.learning_lessons ll ON nps.lesson_id = ll.id
  LEFT JOIN public.learning_modules lm ON ll.module_id = lm.id
  LEFT JOIN public.learning_courses lc ON lm.course_id = lc.id
  LEFT JOIN public.profiles p ON nps.user_id = p.id
  WHERE 
    (v_is_admin OR nps.user_id = auth.uid())
    AND (p_start_date IS NULL OR nps.created_at >= p_start_date)
    AND (p_end_date IS NULL OR nps.created_at <= p_end_date)
  ORDER BY nps.created_at DESC;
END;
$$;