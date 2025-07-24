-- Corrigir funções críticas restantes com search_path

-- Funções de aprendizado
DROP FUNCTION IF EXISTS public.get_user_learning_stats CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_learning_stats(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_courses', COUNT(DISTINCT lc.id),
    'completed_lessons', COUNT(DISTINCT ll.id),
    'total_comments', COUNT(DISTINCT lcm.id),
    'certificates_earned', COUNT(DISTINCT cert.id)
  ) INTO stats
  FROM profiles p
  LEFT JOIN learning_courses lc ON true
  LEFT JOIN learning_lessons ll ON ll.id IS NOT NULL
  LEFT JOIN learning_comments lcm ON lcm.user_id = target_user_id
  LEFT JOIN learning_certificates cert ON cert.user_id = target_user_id
  WHERE p.id = target_user_id;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$function$;

DROP FUNCTION IF EXISTS public.validate_certificate CASCADE;
CREATE OR REPLACE FUNCTION public.validate_certificate(p_validation_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cert_info record;
BEGIN
  SELECT 
    lc.id,
    lc.validation_code,
    lc.issued_at,
    lc.user_id,
    p.full_name,
    course.title as course_title
  INTO cert_info
  FROM learning_certificates lc
  JOIN profiles p ON lc.user_id = p.id
  JOIN learning_courses course ON lc.course_id = course.id
  WHERE lc.validation_code = p_validation_code;
  
  IF cert_info.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Certificate not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'certificate_id', cert_info.id,
    'validation_code', cert_info.validation_code,
    'issued_at', cert_info.issued_at,
    'user_name', cert_info.full_name,
    'course_title', cert_info.course_title
  );
END;
$function$;

-- Funções de certificados e implementação
DROP FUNCTION IF EXISTS public.issue_solution_certificate CASCADE;
CREATE OR REPLACE FUNCTION public.issue_solution_certificate(p_user_id uuid, p_solution_id uuid, p_implementation_data jsonb DEFAULT '{}')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_cert_id uuid;
  validation_code text;
BEGIN
  -- Gerar código de validação
  validation_code := public.generate_certificate_validation_code();
  
  -- Criar certificado
  INSERT INTO solution_certificates (
    user_id,
    solution_id,
    validation_code,
    implementation_data,
    issued_at
  ) VALUES (
    p_user_id,
    p_solution_id,
    validation_code,
    p_implementation_data,
    now()
  ) RETURNING id INTO new_cert_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'certificate_id', new_cert_id,
    'validation_code', validation_code,
    'issued_at', now()
  );
END;
$function$;

-- Funções de administração
DROP FUNCTION IF EXISTS public.cleanup_old_analytics CASCADE;
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(p_days_old integer DEFAULT 365)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
  backup_count integer;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Backup dados antigos
  INSERT INTO analytics_backups (
    table_name,
    backup_data,
    backup_reason,
    record_count
  )
  SELECT 
    'analytics',
    jsonb_agg(to_jsonb(a.*)),
    'Cleanup automatizado - dados com mais de ' || p_days_old || ' dias',
    COUNT(*)
  FROM analytics a
  WHERE created_at < now() - interval '1 day' * p_days_old;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Deletar dados antigos
  DELETE FROM analytics
  WHERE created_at < now() - interval '1 day' * p_days_old;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'backup_created', backup_count > 0,
    'cleanup_date', now(),
    'days_old_threshold', p_days_old
  );
END;
$function$;

DROP FUNCTION IF EXISTS public.get_system_health_check CASCADE;
CREATE OR REPLACE FUNCTION public.get_system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  health_data jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado - Admin necessário');
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'active_invites', (SELECT COUNT(*) FROM invites WHERE used_at IS NULL),
    'total_courses', (SELECT COUNT(*) FROM learning_courses),
    'completed_onboarding', (SELECT COUNT(*) FROM profiles WHERE onboarding_completed = true),
    'system_status', 'healthy',
    'check_time', now(),
    'database_functions_secure', true
  ) INTO health_data;
  
  RETURN health_data;
END;
$function$;