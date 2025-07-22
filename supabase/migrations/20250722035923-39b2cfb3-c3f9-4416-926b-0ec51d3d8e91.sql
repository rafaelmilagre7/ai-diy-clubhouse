-- Criar novas funções de segurança e performance
CREATE OR REPLACE FUNCTION public.is_admin_secure(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id 
    AND ur.name = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = target_user_id 
    AND p.email LIKE '%@viverdeia.ai'
  );
$function$;

-- Função para rate limiting de comentários
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  comment_count integer;
BEGIN
  SELECT COUNT(*) INTO comment_count
  FROM public.learning_comments
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  RETURN comment_count < 10;
END;
$function$;

-- Função para rate limiting de avaliações NPS
CREATE OR REPLACE FUNCTION public.check_nps_rate_limit(p_user_id uuid, p_lesson_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  nps_count integer;
BEGIN
  SELECT COUNT(*) INTO nps_count
  FROM public.learning_lesson_nps
  WHERE user_id = p_user_id
    AND lesson_id = p_lesson_id
    AND created_at > CURRENT_DATE;
  
  RETURN nps_count = 0;
END;
$function$;

-- Função para log de auditoria melhorado
CREATE OR REPLACE FUNCTION public.log_learning_action(
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb DEFAULT '{}'::jsonb
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'learning_action',
    p_action,
    p_resource_id::text,
    p_details || jsonb_build_object(
      'resource_type', p_resource_type,
      'timestamp', NOW()
    ),
    'info'
  );
END;
$function$;

-- Criar índices para melhorar performance (sem usar colunas que não existem)
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_lesson ON public.learning_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_comments_lesson_created ON public.learning_comments(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_lesson_created ON public.learning_lesson_nps(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published ON public.learning_lessons(published, module_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON public.learning_modules(published, course_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_learning_courses_published ON public.learning_courses(published) WHERE published = true;