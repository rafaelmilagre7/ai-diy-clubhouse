-- Criar novas funções de segurança sem conflitos
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
    severity,
    timestamp
  ) VALUES (
    auth.uid(),
    'learning_action',
    p_action,
    p_resource_id::text,
    p_details || jsonb_build_object(
      'resource_type', p_resource_type,
      'timestamp', NOW()
    ),
    'info',
    NOW()
  );
END;
$function$;

-- Função para backup automático de progresso
CREATE OR REPLACE FUNCTION public.backup_user_learning_progress(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  backup_data jsonb;
  backup_id uuid;
BEGIN
  -- Coletar dados de progresso do usuário
  SELECT jsonb_build_object(
    'user_id', target_user_id,
    'progress', COALESCE(array_agg(DISTINCT to_jsonb(lp.*)), ARRAY[]::jsonb[]),
    'comments', COALESCE(array_agg(DISTINCT to_jsonb(lc.*)), ARRAY[]::jsonb[]),
    'nps_ratings', COALESCE(array_agg(DISTINCT to_jsonb(ln.*)), ARRAY[]::jsonb[]),
    'certificates', COALESCE(array_agg(DISTINCT to_jsonb(cert.*)), ARRAY[]::jsonb[]),
    'backup_date', NOW()
  ) INTO backup_data
  FROM public.profiles p
  LEFT JOIN public.learning_progress lp ON p.id = lp.user_id
  LEFT JOIN public.learning_comments lc ON p.id = lc.user_id
  LEFT JOIN public.learning_lesson_nps ln ON p.id = ln.user_id
  LEFT JOIN public.learning_certificates cert ON p.id = cert.user_id
  WHERE p.id = target_user_id
  GROUP BY p.id;
  
  -- Salvar backup
  INSERT INTO public.analytics_backups (
    table_name,
    backup_data,
    backup_reason,
    record_count
  ) VALUES (
    'learning_progress_backup',
    backup_data,
    'Backup automático de progresso de aprendizado',
    1
  ) RETURNING id INTO backup_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'user_id', target_user_id,
    'backup_date', NOW()
  );
END;
$function$;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_lesson ON public.learning_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_comments_lesson_created ON public.learning_comments(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_nps_lesson_created ON public.learning_lesson_nps(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_published ON public.learning_lessons(published, module_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_learning_modules_published ON public.learning_modules(published, course_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_learning_courses_published ON public.learning_courses(published) WHERE published = true;

-- Criar índice para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_learning ON public.audit_logs(event_type, created_at DESC) WHERE event_type = 'learning_action';