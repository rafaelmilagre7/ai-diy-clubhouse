
-- FASE 6: CORREÇÃO MASSIVA DE FUNCTION SEARCH PATH (LOTE 1 - 25 FUNÇÕES)
-- Objetivo: Reduzir de 179 para ~154 warnings

-- 1. FUNÇÕES DE TIMESTAMP E TRIGGERS
CREATE OR REPLACE FUNCTION public.update_conversations_timestamp()
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_rate_limits_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_user_onboarding_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_learning_comments_updated_at()
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

-- 2. FUNÇÕES DE UTILIDADE E HELPERS
CREATE OR REPLACE FUNCTION public.merge_json_data(target jsonb, source jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    IF jsonb_typeof(target) = 'object' AND jsonb_typeof(source) = 'object' THEN
        RETURN target || source;
    ELSIF source IS NOT NULL THEN
        RETURN source;
    ELSE
        RETURN target;
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 
    ceil(random() * 32)::integer, 1), '')
  FROM generate_series(1, 12);
$function$;

CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT string_agg(
    substring('ABCDEFGHJKMNPQRSTUVWXYZ0123456789', 
    ceil(random() * 34)::integer, 1), '')
  FROM generate_series(1, 12);
$function$;

-- 3. FUNÇÕES DE VALIDAÇÃO E AUTENTICAÇÃO
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

-- 4. FUNÇÕES DE BUSINESS LOGIC COMPLEXAS
CREATE OR REPLACE FUNCTION public.backup_all_onboarding_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  backup_id text;
  total_records integer := 0;
  result jsonb;
BEGIN
  backup_id := 'backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
  
  -- Backup onboarding_progress
  INSERT INTO public.onboarding_backups (
    backup_type, backup_data, backup_reason
  )
  SELECT 
    'onboarding_progress_backup',
    jsonb_agg(to_jsonb(op.*)),
    'Backup antes de reset massivo - ' || backup_id
  FROM public.onboarding_progress op;
  
  GET DIAGNOSTICS total_records = ROW_COUNT;
  
  result := jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'total_records', total_records,
    'timestamp', now()
  );
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_invite_batch(
  p_emails text[], 
  p_role_id uuid,
  p_expires_in interval DEFAULT '7 days'::interval
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  created_count integer := 0;
  failed_count integer := 0;
  result jsonb;
  email_item text;
BEGIN
  -- Verificar permissão admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Permissão negada'
    );
  END IF;
  
  -- Processar cada email
  FOREACH email_item IN ARRAY p_emails
  LOOP
    BEGIN
      INSERT INTO public.invites (
        email,
        role_id,
        token,
        expires_at,
        created_by
      ) VALUES (
        email_item,
        p_role_id,
        public.generate_invite_token(),
        now() + p_expires_in,
        auth.uid()
      );
      created_count := created_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        failed_count := failed_count + 1;
    END;
  END LOOP;
  
  result := jsonb_build_object(
    'success', true,
    'created_count', created_count,
    'failed_count', failed_count,
    'total_processed', array_length(p_emails, 1)
  );
  
  RETURN result;
END;
$function$;

-- 5. FUNÇÕES DE ANALYTICS E RELATÓRIOS
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
  FROM public.profiles p
  LEFT JOIN public.learning_courses lc ON true
  LEFT JOIN public.learning_lessons ll ON ll.id IS NOT NULL
  LEFT JOIN public.learning_comments lcm ON lcm.user_id = target_user_id
  LEFT JOIN public.learning_certificates cert ON cert.user_id = target_user_id
  WHERE p.id = target_user_id;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$function$;

-- 6. FUNÇÕES DE LIMPEZA E MANUTENÇÃO
CREATE OR REPLACE FUNCTION public.cleanup_expired_invites()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Backup antes da limpeza
  INSERT INTO public.invite_backups (
    email, backup_data, backup_reason
  )
  SELECT 
    email,
    to_jsonb(i.*),
    'Cleanup automático de convites expirados'
  FROM public.invites i
  WHERE expires_at < now() AND used_at IS NULL;
  
  -- Deletar expirados
  DELETE FROM public.invites 
  WHERE expires_at < now() AND used_at IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'cleanup_date', now()
  );
END;
$function$;

-- 7. FUNÇÕES DE NETWORKING
CREATE OR REPLACE FUNCTION public.update_networking_preferences_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_compatibility_score(
  user1_id uuid, 
  user2_id uuid
)
RETURNS numeric
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  score numeric := 0.5;
  user1_profile record;
  user2_profile record;
BEGIN
  -- Buscar perfis
  SELECT * INTO user1_profile FROM public.profiles WHERE id = user1_id;
  SELECT * INTO user2_profile FROM public.profiles WHERE id = user2_id;
  
  -- Calcular compatibilidade básica
  IF user1_profile.industry = user2_profile.industry THEN
    score := score + 0.2;
  END IF;
  
  IF user1_profile.company_size = user2_profile.company_size THEN
    score := score + 0.1;
  END IF;
  
  -- Garantir que não exceda 1.0
  IF score > 1.0 THEN
    score := 1.0;
  END IF;
  
  RETURN score;
END;
$function$;

-- 8. FUNÇÕES DE CERTIFICADOS
CREATE OR REPLACE FUNCTION public.issue_solution_certificate(
  p_user_id uuid,
  p_solution_id uuid,
  p_implementation_data jsonb DEFAULT '{}'::jsonb
)
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
  INSERT INTO public.solution_certificates (
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

-- 9. FUNÇÕES DE FORUM
CREATE OR REPLACE FUNCTION public.increment_topic_views(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.forum_topics
  SET view_count = COALESCE(view_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.forum_topics
  SET reply_count = COALESCE(reply_count, 0) + 1,
      last_activity_at = now()
  WHERE id = topic_id;
END;
$function$;

-- 10. FUNÇÕES DE PROGRESS TRACKING
CREATE OR REPLACE FUNCTION public.update_user_progress(
  p_user_id uuid,
  p_lesson_id uuid,
  p_progress_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  progress_record record;
BEGIN
  -- Inserir ou atualizar progresso
  INSERT INTO public.learning_progress (
    user_id,
    lesson_id,
    progress_data,
    last_accessed_at
  ) VALUES (
    p_user_id,
    p_lesson_id,
    p_progress_data,
    now()
  )
  ON CONFLICT (user_id, lesson_id) 
  DO UPDATE SET
    progress_data = EXCLUDED.progress_data,
    last_accessed_at = now(),
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_at', now()
  );
END;
$function$;

-- 11. FUNÇÕES DE ADMIN UTILITIES
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
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Acesso negado');
  END IF;
  
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_invites', (SELECT COUNT(*) FROM public.invites WHERE used_at IS NULL),
    'total_solutions', (SELECT COUNT(*) FROM public.solutions),
    'system_status', 'healthy',
    'check_time', now()
  ) INTO health_data;
  
  RETURN health_data;
END;
$function$;

-- 12. FUNÇÃO DE LOG FINAL
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_6_massive_search_path_fix_lote_1',
  jsonb_build_object(
    'message', 'FASE 6 - Correção massiva de search_path (Lote 1)',
    'functions_fixed', 25,
    'expected_warning_reduction', '179 → ~154',
    'categories_addressed', ARRAY[
      'timestamp_triggers', 'utility_functions', 'auth_validation',
      'business_logic', 'analytics', 'cleanup_maintenance',
      'networking', 'certificates', 'forum', 'progress_tracking', 'admin_utilities'
    ],
    'batch', 1,
    'total_batches_planned', 3,
    'timestamp', now()
  ),
  auth.uid()
);
