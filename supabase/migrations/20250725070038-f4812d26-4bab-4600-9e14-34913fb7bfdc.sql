-- ÚLTIMO LOTE: Corrigindo todas as funções restantes

-- Função 51: check_invite_rate_limit
CREATE OR REPLACE FUNCTION public.check_invite_rate_limit(p_action_type text, p_identifier text DEFAULT NULL::text, p_max_attempts integer DEFAULT 20, p_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_attempt_count INTEGER;
BEGIN
  -- Configurações muito mais permissivas para convites
  -- 20 tentativas em 60 minutos = muito mais generoso
  
  -- Calculate window start time
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count attempts in the current window
  SELECT COUNT(*)
  INTO v_attempt_count
  FROM public.rate_limits
  WHERE identifier = COALESCE(p_identifier, auth.uid()::text, 'anonymous')
    AND action_type = p_action_type
    AND created_at >= v_window_start;
  
  -- Log da verificação para debug
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    auth.uid(), 
    'invite_rate_limit_check', 
    p_action_type,
    jsonb_build_object(
      'attempts', v_attempt_count,
      'max_attempts', p_max_attempts,
      'window_minutes', p_window_minutes,
      'allowed', v_attempt_count < p_max_attempts
    )
  );
  
  -- Check if limit exceeded
  IF v_attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Função 52: get_cached_profile
CREATE OR REPLACE FUNCTION public.get_cached_profile(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_data jsonb;
  user_role_data jsonb;
BEGIN
  -- Log para debug
  RAISE NOTICE '[CACHE] Buscando perfil para usuário: %', target_user_id;
  
  -- Buscar dados do perfil
  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.id = target_user_id;
  
  -- Se não encontrou o perfil, retornar null
  IF profile_data IS NULL THEN
    RAISE NOTICE '[CACHE] Perfil não encontrado para: %', target_user_id;
    RETURN NULL;
  END IF;
  
  -- Buscar dados do role separadamente
  SELECT to_jsonb(ur.*) INTO user_role_data
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se encontrou role, adicionar ao perfil
  IF user_role_data IS NOT NULL THEN
    profile_data := profile_data || jsonb_build_object('user_roles', user_role_data);
    RAISE NOTICE '[CACHE] Role encontrado: %', user_role_data->>'name';
  ELSE
    RAISE NOTICE '[CACHE] Role não encontrado para usuário: %', target_user_id;
    profile_data := profile_data || jsonb_build_object('user_roles', null);
  END IF;
  
  -- Log final
  RAISE NOTICE '[CACHE] Perfil completo retornado: nome=%, role=%', 
    profile_data->>'name', 
    profile_data->'user_roles'->>'name';
  
  RETURN profile_data;
END;
$function$;

-- Função 53: check_admin_access
CREATE OR REPLACE FUNCTION public.check_admin_access()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_role text;
  v_is_admin boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT ur.name INTO v_user_role
  FROM profiles p
  INNER JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  v_is_admin := (v_user_role = 'admin');
  
  -- Log apenas se usuário autenticado existir
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, event_type, action, details, severity) VALUES (
      auth.uid(), 'admin_access_check', 'check_admin_access',
      jsonb_build_object('user_role', v_user_role, 'access_granted', v_is_admin),
      CASE WHEN v_is_admin THEN 'info' ELSE 'warning' END
    );
  END IF;
  
  RETURN v_is_admin;
END;
$function$;

-- Função 54: log_critical_action
CREATE OR REPLACE FUNCTION public.log_critical_action(p_action text, p_details jsonb DEFAULT '{}'::jsonb)
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
    severity,
    timestamp
  ) VALUES (
    auth.uid(),
    'critical_action',
    p_action,
    p_details,
    'high',
    NOW()
  );
END;
$function$;

-- Função 55: handle_supabase_email_rate_limit_error
CREATE OR REPLACE FUNCTION public.handle_supabase_email_rate_limit_error(error_message text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  clean_email TEXT;
  invite_exists BOOLEAN := FALSE;
  result JSONB;
BEGIN
  -- Verificar se é erro de rate limit de email
  IF error_message LIKE '%email rate limit exceeded%' OR error_message LIKE '%rate limit%' THEN
    
    -- Log do erro para monitoramento
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'supabase_rate_limit_error',
      'email_rate_limit_exceeded',
      jsonb_build_object(
        'error_message', error_message,
        'timestamp', NOW(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      ),
      'warning'
    );
    
    RETURN jsonb_build_object(
      'error_type', 'email_rate_limit',
      'retry_after_minutes', 5,
      'suggested_action', 'wait_and_retry',
      'user_message', 'O sistema detectou muitas tentativas de envio de email. Aguarde 5 minutos e tente novamente.',
      'support_message', 'Se o problema persistir, entre em contato com o suporte.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'error_type', 'unknown',
    'user_message', 'Erro desconhecido. Tente novamente.'
  );
END;
$function$;

-- Função 56: sync_onboarding_to_profile
CREATE OR REPLACE FUNCTION public.sync_onboarding_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Atualizar perfil quando onboarding for completado
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE public.profiles
    SET 
      name = COALESCE(NEW.name, name),
      company_name = COALESCE(NEW.company_name, company_name),
      industry = COALESCE(NEW.business_sector, industry),
      onboarding_completed = NEW.is_completed,
      onboarding_completed_at = COALESCE(NEW.completed_at, now())
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;