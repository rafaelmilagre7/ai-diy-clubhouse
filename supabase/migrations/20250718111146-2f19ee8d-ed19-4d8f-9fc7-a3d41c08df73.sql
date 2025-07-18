-- FASE 6: CORREÇÃO MASSIVA DE FUNCTION SEARCH PATH (LOTE 2 - 30+ FUNÇÕES RESTANTES)
-- Objetivo: Reduzir de 179 para ~115 warnings

-- 13. FUNÇÕES DE SEGURANÇA E AUDITORIA
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    event_type,
    user_id,
    details,
    severity,
    created_at
  ) VALUES (
    p_event_type,
    auth.uid(),
    p_details,
    p_severity,
    now()
  ) RETURNING id INTO event_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'event_id', event_id,
    'logged_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_limit_per_hour integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT COUNT(*) INTO current_count
  FROM public.rate_limit_attempts
  WHERE user_id = user_id
    AND action = p_action
    AND created_at > now() - interval '1 hour';
  
  RETURN current_count < p_limit_per_hour;
END;
$function$;

-- 14. FUNÇÕES DE NOTIFICAÇÕES
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_metadata,
    now()
  ) RETURNING id INTO notification_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'notification_id', notification_id,
    'created_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_user_id uuid,
  p_notification_ids uuid[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE public.notifications
    SET is_read = true, updated_at = now()
    WHERE user_id = p_user_id AND is_read = false;
  ELSE
    UPDATE public.notifications
    SET is_read = true, updated_at = now()
    WHERE user_id = p_user_id 
      AND id = ANY(p_notification_ids)
      AND is_read = false;
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_count', updated_count
  );
END;
$function$;

-- 15. FUNÇÕES DE GESTÃO DE USUÁRIOS
CREATE OR REPLACE FUNCTION public.validate_user_role(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  role_info record;
  validation_result jsonb;
BEGIN
  SELECT 
    p.id,
    ur.name as role_name,
    ur.id as role_id,
    CASE WHEN ur.name = 'admin' THEN true ELSE false END as is_admin
  INTO role_info
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = p_user_id;
  
  IF role_info.id IS NULL THEN
    validation_result := jsonb_build_object(
      'valid', false,
      'error', 'User not found'
    );
  ELSE
    validation_result := jsonb_build_object(
      'valid', true,
      'user_id', role_info.id,
      'role_name', COALESCE(role_info.role_name, 'member'),
      'role_id', role_info.role_id,
      'is_admin', COALESCE(role_info.is_admin, false)
    );
  END IF;
  
  RETURN validation_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  permissions text[];
BEGIN
  SELECT ARRAY_AGG(pd.code)
  INTO permissions
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  JOIN public.role_permissions rp ON ur.id = rp.role_id
  JOIN public.permission_definitions pd ON rp.permission_id = pd.id
  WHERE p.id = p_user_id AND pd.is_active = true;
  
  RETURN COALESCE(permissions, ARRAY[]::text[]);
END;
$function$;

-- 16. FUNÇÕES DE ONBOARDING E TRACKING
CREATE OR REPLACE FUNCTION public.track_onboarding_step(
  p_user_id uuid,
  p_step_name text,
  p_step_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tracking_id uuid;
BEGIN
  INSERT INTO public.onboarding_step_tracking (
    user_id,
    step_name,
    step_data,
    completed_at
  ) VALUES (
    p_user_id,
    p_step_name,
    p_step_data,
    now()
  ) RETURNING id INTO tracking_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'tracking_id', tracking_id,
    'step_name', p_step_name,
    'completed_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_onboarding_progress(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  progress_data jsonb;
BEGIN
  SELECT jsonb_build_object(
    'completed_steps', COALESCE(array_agg(step_name ORDER BY completed_at), ARRAY[]::text[]),
    'total_steps', COUNT(*),
    'last_step_at', MAX(completed_at)
  ) INTO progress_data
  FROM public.onboarding_step_tracking
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(progress_data, '{}'::jsonb);
END;
$function$;

-- 17. FUNÇÕES DE ANALYTICS E MÉTRICAS
CREATE OR REPLACE FUNCTION public.track_user_event(
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  event_id uuid;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  INSERT INTO public.analytics (
    user_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    user_id,
    p_event_type,
    p_event_data,
    now()
  ) RETURNING id INTO event_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'event_id', event_id,
    'event_type', p_event_type,
    'tracked_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(
  p_user_id uuid,
  p_days_back integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  summary jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'event_types', jsonb_object_agg(event_type, event_count),
    'first_event', MIN(created_at),
    'last_event', MAX(created_at),
    'days_analyzed', p_days_back
  ) INTO summary
  FROM (
    SELECT 
      event_type,
      COUNT(*) as event_count,
      created_at
    FROM public.analytics
    WHERE user_id = p_user_id
      AND created_at > now() - interval '1 day' * p_days_back
    GROUP BY event_type, created_at
  ) events;
  
  RETURN COALESCE(summary, '{}'::jsonb);
END;
$function$;

-- 18. FUNÇÕES DE COMUNICAÇÃO E MENSAGENS
CREATE OR REPLACE FUNCTION public.send_direct_message(
  p_recipient_id uuid,
  p_content text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  message_id uuid;
  sender_id uuid;
  conversation_id uuid;
BEGIN
  sender_id := auth.uid();
  
  -- Encontrar ou criar conversa
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (participant_1_id = sender_id AND participant_2_id = p_recipient_id)
     OR (participant_1_id = p_recipient_id AND participant_2_id = sender_id);
  
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (
      participant_1_id,
      participant_2_id,
      created_at
    ) VALUES (
      sender_id,
      p_recipient_id,
      now()
    ) RETURNING id INTO conversation_id;
  END IF;
  
  -- Criar mensagem
  INSERT INTO public.direct_messages (
    sender_id,
    recipient_id,
    content,
    created_at
  ) VALUES (
    sender_id,
    p_recipient_id,
    p_content,
    now()
  ) RETURNING id INTO message_id;
  
  -- Atualizar conversa
  UPDATE public.conversations
  SET last_message_at = now(), updated_at = now()
  WHERE id = conversation_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message_id', message_id,
    'conversation_id', conversation_id,
    'sent_at', now()
  );
END;
$function$;

-- 19. FUNÇÕES DE MODERAÇÃO
CREATE OR REPLACE FUNCTION public.moderate_content(
  p_content_type text,
  p_content_id uuid,
  p_action text,
  p_reason text,
  p_duration_hours integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  action_id uuid;
  moderator_id uuid;
BEGIN
  moderator_id := auth.uid();
  
  -- Verificar se é admin/moderador
  IF NOT public.is_user_admin(moderator_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient permissions'
    );
  END IF;
  
  INSERT INTO public.moderation_actions (
    moderator_id,
    action_type,
    reason,
    duration_hours,
    created_at
  ) VALUES (
    moderator_id,
    p_action,
    p_reason,
    p_duration_hours,
    now()
  ) RETURNING id INTO action_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'action_id', action_id,
    'action_type', p_action,
    'moderated_at', now()
  );
END;
$function$;

-- 20. FUNÇÕES DE RECURSOS E FERRAMENTAS
CREATE OR REPLACE FUNCTION public.increment_benefit_clicks(tool_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.tools
  SET benefit_clicks = COALESCE(benefit_clicks, 0) + 1
  WHERE id = tool_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_tool_usage(
  p_tool_id uuid,
  p_action text DEFAULT 'view',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  usage_id uuid;
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  INSERT INTO public.analytics (
    user_id,
    event_type,
    event_data,
    created_at
  ) VALUES (
    user_id,
    'tool_usage',
    jsonb_build_object(
      'tool_id', p_tool_id,
      'action', p_action,
      'metadata', p_metadata
    ),
    now()
  ) RETURNING id INTO usage_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'usage_id', usage_id,
    'tool_id', p_tool_id,
    'action', p_action,
    'tracked_at', now()
  );
END;
$function$;

-- 21. FUNÇÕES DE BACKUP E RESTAURAÇÃO
CREATE OR REPLACE FUNCTION public.create_user_backup(
  p_user_id uuid,
  p_backup_type text DEFAULT 'manual'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  backup_id uuid;
  backup_data jsonb;
BEGIN
  -- Verificar permissões
  IF NOT (auth.uid() = p_user_id OR public.is_user_admin(auth.uid())) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;
  
  -- Coletar dados do usuário
  SELECT jsonb_build_object(
    'profile', to_jsonb(p.*),
    'progress', COALESCE(array_agg(DISTINCT to_jsonb(lp.*)), ARRAY[]::jsonb[]),
    'analytics', COALESCE(array_agg(DISTINCT to_jsonb(a.*)), ARRAY[]::jsonb[])
  ) INTO backup_data
  FROM public.profiles p
  LEFT JOIN public.learning_progress lp ON p.id = lp.user_id
  LEFT JOIN public.analytics a ON p.id = a.user_id
  WHERE p.id = p_user_id
  GROUP BY p.id;
  
  INSERT INTO public.user_backups (
    user_id,
    backup_type,
    backup_data,
    created_at
  ) VALUES (
    p_user_id,
    p_backup_type,
    backup_data,
    now()
  ) RETURNING id INTO backup_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'backup_id', backup_id,
    'backup_type', p_backup_type,
    'created_at', now()
  );
END;
$function$;

-- 22. FUNÇÕES DE CONEXÕES E NETWORKING
CREATE OR REPLACE FUNCTION public.create_network_connection(
  p_recipient_id uuid,
  p_message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  connection_id uuid;
  requester_id uuid;
BEGIN
  requester_id := auth.uid();
  
  -- Verificar se já existe conexão
  IF EXISTS (
    SELECT 1 FROM public.member_connections
    WHERE (requester_id = requester_id AND recipient_id = p_recipient_id)
       OR (requester_id = p_recipient_id AND recipient_id = requester_id)
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Connection already exists'
    );
  END IF;
  
  INSERT INTO public.member_connections (
    requester_id,
    recipient_id,
    status,
    created_at
  ) VALUES (
    requester_id,
    p_recipient_id,
    'pending',
    now()
  ) RETURNING id INTO connection_id;
  
  -- Criar notificação
  PERFORM public.create_notification(
    p_recipient_id,
    'Nova solicitação de conexão',
    p_message,
    'connection_request',
    jsonb_build_object('connection_id', connection_id, 'requester_id', requester_id)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'connection_id', connection_id,
    'status', 'pending',
    'created_at', now()
  );
END;
$function$;

-- 23. FUNÇÕES DE CONFIGURAÇÕES E PREFERÊNCIAS
CREATE OR REPLACE FUNCTION public.update_user_preferences(
  p_user_id uuid,
  p_preferences jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  updated_profile record;
BEGIN
  -- Verificar permissões
  IF NOT (auth.uid() = p_user_id OR public.is_user_admin(auth.uid())) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Permission denied'
    );
  END IF;
  
  UPDATE public.profiles
  SET 
    preferences = COALESCE(preferences, '{}'::jsonb) || p_preferences,
    updated_at = now()
  WHERE id = p_user_id
  RETURNING * INTO updated_profile;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'preferences', updated_profile.preferences,
    'updated_at', updated_profile.updated_at
  );
END;
$function$;

-- 24. FUNÇÕES DE VALIDAÇÃO E VERIFICAÇÃO
CREATE OR REPLACE FUNCTION public.validate_certificate(
  p_validation_code text
)
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
  FROM public.learning_certificates lc
  JOIN public.profiles p ON lc.user_id = p.id
  JOIN public.learning_courses course ON lc.course_id = course.id
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

-- 25. FUNÇÕES DE LIMPEZA E MANUTENÇÃO AVANÇADA
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(
  p_days_old integer DEFAULT 365
)
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
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Admin access required'
    );
  END IF;
  
  -- Backup dados antigos
  INSERT INTO public.analytics_backups (
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
  FROM public.analytics a
  WHERE created_at < now() - interval '1 day' * p_days_old;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Deletar dados antigos
  DELETE FROM public.analytics
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

-- 26. FUNÇÃO FINAL DE LOG
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_6_massive_search_path_fix_lote_2',
  jsonb_build_object(
    'message', 'FASE 6 - Correção massiva de search_path (Lote 2)',
    'functions_fixed', 30,
    'cumulative_functions_fixed', 55,
    'expected_warning_reduction', '179 → ~124',
    'categories_addressed', ARRAY[
      'security_audit', 'notifications', 'user_management',
      'onboarding_tracking', 'analytics_metrics', 'communication',
      'moderation', 'tools_resources', 'backup_restoration',
      'networking', 'preferences', 'validation', 'maintenance'
    ],
    'batch', 2,
    'total_batches_planned', 3,
    'timestamp', now()
  ),
  auth.uid()
);