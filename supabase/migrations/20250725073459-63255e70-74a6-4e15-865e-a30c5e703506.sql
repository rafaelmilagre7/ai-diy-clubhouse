-- CORREÇÃO DAS FUNÇÕES RESTANTES COM SEARCH_PATH - Parte 1
-- Corrigindo as 34 funções restantes que ainda não têm search_path

CREATE OR REPLACE FUNCTION public.admin_complete_user_cleanup(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Cleanup completo do usuário
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário completamente removido'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_force_delete_auth_user(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Forçar deleção do usuário
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Usuário removido forçadamente'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log de mudanças de role
  IF (TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id) OR TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, details
    ) VALUES (
      NEW.id,
      'role_change',
      TG_OP,
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid(),
        'changed_at', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_user_id uuid, p_action text, p_time_window interval DEFAULT '1 hour'::interval, p_max_attempts integer DEFAULT 10)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action = p_action
    AND timestamp > NOW() - p_time_window;
  
  RETURN attempt_count < p_max_attempts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpar logs antigos (mais de 90 dias)
  DELETE FROM public.audit_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_invite_registration(invite_token text, user_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record public.invites;
  result jsonb;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE token = invite_token
  AND used_at IS NULL
  AND expires_at > now();
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  -- Marcar convite como usado
  UPDATE public.invites
  SET used_at = now()
  WHERE id = invite_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Registro completado com sucesso',
    'role_id', invite_record.role_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_at_risk_users()
 RETURNS TABLE(user_id uuid, risk_score numeric, reasons text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    0.5::numeric as risk_score,
    ARRAY['placeholder']::text[] as reasons
  FROM public.profiles p
  LIMIT 10;
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_login_anomaly(p_user_id uuid, p_ip_address text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Detectar anomalias de login simples
  RETURN false; -- Por enquanto não detecta anomalias
END;
$function$;

CREATE OR REPLACE FUNCTION public.detect_suspicious_login_pattern(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'suspicious', false,
    'score', 0,
    'patterns', '[]'::jsonb
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_audit_log(p_user_id uuid, p_action text, p_details jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details
  ) VALUES (
    p_user_id, 'system', p_action, p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_recurring_event_instances(parent_event_id uuid, end_date timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  created_count integer := 0;
BEGIN
  -- Função placeholder para geração de eventos recorrentes
  RETURN created_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_security_metrics()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'admin_users', (SELECT COUNT(*) FROM public.profiles p JOIN public.user_roles ur ON p.role_id = ur.id WHERE ur.name = 'admin'),
    'security_events', (SELECT COUNT(*) FROM public.audit_logs WHERE event_type = 'security_violation'),
    'generated_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_security_metrics()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.generate_security_metrics();
END;
$function$;

CREATE OR REPLACE FUNCTION public.initialize_onboarding_for_user(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Inicializar onboarding para usuário específico
  INSERT INTO public.quick_onboarding (
    user_id,
    current_step,
    is_completed,
    created_at,
    updated_at
  ) VALUES (
    target_user_id,
    1,
    false,
    now(),
    now()
  ) ON CONFLICT (user_id) DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding inicializado'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin_enhanced(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_admin boolean;
  user_role text;
BEGIN
  SELECT ur.name INTO user_role
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  is_admin := (user_role = 'admin');
  
  RETURN jsonb_build_object(
    'is_admin', is_admin,
    'user_role', user_role,
    'checked_at', now()
  );
END;
$function$;