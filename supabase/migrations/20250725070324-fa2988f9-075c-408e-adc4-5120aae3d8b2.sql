-- FINALIZAÇÃO TOTAL: Últimas funções que faltam

-- Verificar se estas funções existem e corrigi-las também

-- Funções que podem estar faltando:
CREATE OR REPLACE FUNCTION public.log_registration_attempt(p_email text, p_success boolean, p_error_details jsonb DEFAULT '{}'::jsonb)
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
    details,
    severity
  ) VALUES (
    auth.uid(),
    'registration_attempt',
    CASE WHEN p_success THEN 'registration_success' ELSE 'registration_failed' END,
    jsonb_build_object(
      'email', p_email,
      'success', p_success,
      'error_details', p_error_details,
      'timestamp', NOW(),
      'ip_info', current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
    ),
    CASE WHEN p_success THEN 'info' ELSE 'warning' END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_invite_automatically()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_data jsonb;
  role_name text;
BEGIN
  -- Buscar dados do role
  SELECT ur.name INTO role_name
  FROM public.user_roles ur
  WHERE ur.id = NEW.role_id;
  
  -- Log do trigger
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    NEW.created_by,
    'invite_automation',
    'auto_send_triggered',
    NEW.id::text,
    jsonb_build_object(
      'invite_id', NEW.id,
      'email', NEW.email,
      'channel', NEW.preferred_channel,
      'trigger_time', now()
    ),
    'info'
  );
  
  -- Marcar para envio (será processado pelas Edge Functions)
  RAISE NOTICE 'Convite criado para envio automático: % (%)', NEW.email, role_name;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit_safe(p_action text, p_limit_per_hour integer DEFAULT 60, p_limit_per_minute integer DEFAULT 10, p_identifier text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_identifier text;
  v_count_hour integer := 0;
  v_count_minute integer := 0;
  v_blocked_until timestamp;
BEGIN
  v_user_id := auth.uid();
  v_identifier := COALESCE(p_identifier, v_user_id::text, 'anonymous');
  
  SELECT blocked_until INTO v_blocked_until
  FROM public.rate_limit_blocks 
  WHERE identifier = v_identifier 
  AND action = p_action 
  AND blocked_until > NOW()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', v_blocked_until,
      'reason', 'temporarily_blocked'
    );
  END IF;
  
  SELECT COUNT(*) INTO v_count_hour
  FROM public.audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  SELECT COUNT(*) INTO v_count_minute
  FROM public.audit_logs
  WHERE (user_id = v_user_id OR details->>'identifier' = v_identifier)
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 minute';
  
  IF v_count_hour >= p_limit_per_hour OR v_count_minute >= p_limit_per_minute THEN
    INSERT INTO public.rate_limit_blocks (identifier, action, blocked_until)
    VALUES (v_identifier, p_action, NOW() + INTERVAL '1 hour')
    ON CONFLICT (identifier, action) 
    DO UPDATE SET blocked_until = NOW() + INTERVAL '1 hour';
    
    RETURN jsonb_build_object(
      'allowed', false,
      'blocked_until', NOW() + INTERVAL '1 hour',
      'reason', 'rate_limit_exceeded'
    );
  END IF;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.audit_logs (user_id, event_type, action, details) VALUES (
      v_user_id, 'rate_limit_check', p_action,
      jsonb_build_object(
        'identifier', v_identifier,
        'count_hour', v_count_hour + 1, 
        'count_minute', v_count_minute + 1,
        'limit_hour', p_limit_per_hour,
        'limit_minute', p_limit_per_minute
      )
    );
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', true,
    'remaining_hour', p_limit_per_hour - v_count_hour - 1,
    'remaining_minute', p_limit_per_minute - v_count_minute - 1
  );
END;
$function$;

-- Outras funções comuns que podem estar sem search_path:
CREATE OR REPLACE FUNCTION public.update_solution_ratings_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_implementation_tab_progress_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_certificate_files_updated_at()
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