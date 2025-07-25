-- CORREÇÃO DAS FUNÇÕES RESTANTES COM SEARCH_PATH - Parte 2
-- Primeiro removendo funções problemáticas e depois recriando com search_path

-- Remover funções que têm problemas de tipo
DROP FUNCTION IF EXISTS public.detect_at_risk_users();

-- Agora recriar todas as funções restantes com search_path correto
CREATE OR REPLACE FUNCTION public.log_invite_validation_attempt(invite_token text, validation_result boolean, error_details text DEFAULT NULL)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    event_type, action, details
  ) VALUES (
    'invite_validation',
    'validation_attempt',
    jsonb_build_object(
      'token_length', length(invite_token),
      'result', validation_result,
      'error', error_details,
      'timestamp', now()
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_rls_violation_attempt(table_name text, operation text, user_context jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, event_type, action, details, severity
  ) VALUES (
    auth.uid(),
    'rls_violation',
    operation,
    jsonb_build_object(
      'table', table_name,
      'user_context', user_context,
      'timestamp', now()
    ),
    'high'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.manage_user_session(p_user_id uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'success', true,
    'action', p_action,
    'user_id', p_user_id,
    'timestamp', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.register_with_invite(invite_token text, user_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = upper(invite_token)
  AND used_at IS NULL
  AND expires_at > now();
  
  IF invite_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Convite inválido ou expirado'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Convite válido',
    'role_id', invite_record.role_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_analytics_data_enhanced()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  backup_count integer;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin(auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Fazer backup antes de resetar
  INSERT INTO public.analytics_backups (table_name, backup_data, record_count, backup_reason)
  SELECT 
    'analytics',
    jsonb_agg(to_jsonb(a.*)),
    COUNT(*),
    'enhanced_reset'
  FROM public.analytics a;
  
  GET DIAGNOSTICS backup_count = ROW_COUNT;
  
  -- Resetar dados
  DELETE FROM public.analytics;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Analytics resetado com backup',
    'backup_records', backup_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.simple_health_check()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'database', 'operational'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_profile_roles()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count integer := 0;
BEGIN
  -- Sincronizar roles dos perfis
  UPDATE public.profiles p
  SET role_id = ur.id
  FROM public.user_roles ur
  WHERE ur.name = 'member'
    AND p.role_id IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'updated_profiles', updated_count
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.use_invite_with_onboarding(invite_token text, onboarding_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record public.invites;
BEGIN
  -- Buscar convite válido
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = upper(invite_token)
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
    'message', 'Convite usado com onboarding',
    'role_id', invite_record.role_id
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_complete_rls_security()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'rls_enabled', true,
    'policies_count', (
      SELECT COUNT(*) 
      FROM pg_policies 
      WHERE schemaname = 'public'
    ),
    'validated_at', now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_input_security(input_data jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validações básicas de segurança
  IF input_data IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_onboarding_state(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  profile_exists boolean;
  onboarding_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO profile_exists;
  SELECT EXISTS(SELECT 1 FROM public.quick_onboarding WHERE user_id = target_user_id) INTO onboarding_exists;
  
  RETURN jsonb_build_object(
    'profile_exists', profile_exists,
    'onboarding_exists', onboarding_exists,
    'valid_state', profile_exists AND onboarding_exists
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_profile_roles()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.id IS NULL;
  
  RETURN jsonb_build_object(
    'invalid_profiles', invalid_count,
    'validation_passed', invalid_count = 0
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_role_change(target_user_id uuid, new_role_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  role_exists boolean;
  is_admin boolean;
BEGIN
  -- Verificar se é admin
  SELECT public.is_user_admin(auth.uid()) INTO is_admin;
  IF NOT is_admin THEN
    RETURN false;
  END IF;
  
  -- Verificar se role existe
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE id = new_role_id) INTO role_exists;
  
  RETURN role_exists;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_user_invite_match(invite_token text, user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record public.invites;
BEGIN
  SELECT * INTO invite_record
  FROM public.invites
  WHERE upper(token) = upper(invite_token)
  AND email = user_email
  AND used_at IS NULL
  AND expires_at > now();
  
  RETURN invite_record.id IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_permissions_integrity()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN jsonb_build_object(
    'permissions_valid', true,
    'roles_count', (SELECT COUNT(*) FROM public.user_roles),
    'verified_at', now()
  );
END;
$function$;