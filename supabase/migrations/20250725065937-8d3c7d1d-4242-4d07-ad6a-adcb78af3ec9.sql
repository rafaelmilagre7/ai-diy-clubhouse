-- FINAL DA CORREÇÃO DE SEGURANÇA: Últimas funções restantes

-- Função 42: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_user_admin(auth.uid());
$function$;

-- Função 43: update_member_connections_updated_at
CREATE OR REPLACE FUNCTION public.update_member_connections_updated_at()
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

-- Função 44: is_admin_secure
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

-- Função 45: check_comment_rate_limit
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

-- Função 46: check_nps_rate_limit
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

-- Função 47: log_learning_action
CREATE OR REPLACE FUNCTION public.log_learning_action(p_action text, p_resource_type text, p_resource_id uuid, p_details jsonb DEFAULT '{}'::jsonb)
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

-- Função 48: get_user_permissions
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
  WHERE p.id = p_user_id;
  
  RETURN COALESCE(permissions, ARRAY[]::text[]);
END;
$function$;

-- Função 49: validate_admin_access
CREATE OR REPLACE FUNCTION public.validate_admin_access(user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
  user_email text;
  is_admin_result boolean := false;
BEGIN
  -- Buscar role do usuário
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id
  LIMIT 1;
  
  -- Buscar email do usuário
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = user_id
  LIMIT 1;
  
  -- Verificar se é admin por role ou email @viverdeia.ai
  is_admin_result := (user_role_name = 'admin') OR (user_email LIKE '%@viverdeia.ai');
  
  RETURN jsonb_build_object(
    'is_admin', is_admin_result,
    'user_role', COALESCE(user_role_name, 'member'),
    'user_email', COALESCE(user_email, 'not_found'),
    'validation_method', CASE 
      WHEN user_role_name = 'admin' THEN 'role_based'
      WHEN user_email LIKE '%@viverdeia.ai' THEN 'email_based'
      ELSE 'not_admin'
    END
  );
END;
$function$;

-- Função 50: check_rate_limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_action text, p_limit_per_hour integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer := 0;
BEGIN
  -- Se não há usuário autenticado, limitar drasticamente
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Contar ações da última hora
  SELECT COUNT(*)
  INTO current_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND action = p_action
    AND timestamp > now() - interval '1 hour';
  
  -- Log da verificação
  PERFORM public.log_critical_action(
    'rate_limit_check',
    jsonb_build_object(
      'action', p_action,
      'current_count', current_count,
      'limit', p_limit_per_hour,
      'allowed', current_count < p_limit_per_hour
    )
  );
  
  RETURN current_count < p_limit_per_hour;
END;
$function$;