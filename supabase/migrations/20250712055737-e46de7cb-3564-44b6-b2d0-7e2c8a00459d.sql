-- CORREÇÃO DE SEARCH_PATH MUTÁVEL EM FUNÇÕES - FASE 2
-- Funções de segurança e permissão (críticas)

CREATE OR REPLACE FUNCTION public.has_role_name(role_name text, check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  WITH target_user AS (
    SELECT COALESCE(check_user_id, auth.uid()) as user_id
  )
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = (SELECT user_id FROM target_user)
    AND ur.name = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_admin_user boolean := false;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = COALESCE(user_id, auth.uid())
    AND ur.name = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    LEFT JOIN public.role_permissions rp ON ur.id = rp.role_id
    LEFT JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_id
    AND (
      ur.permissions->>'all' = 'true' OR 
      pd.code = permission_code
    )
  ) INTO has_permission;

  RETURN has_permission;
END;
$function$;

CREATE OR REPLACE FUNCTION public.quick_check_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND (ur.name = 'admin' OR ur.permissions->>'all' = 'true')
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.role_permissions rp ON p.role_id = rp.role_id
    JOIN public.permission_definitions pd ON rp.permission_id = pd.id
    WHERE p.id = user_id AND pd.code = permission_code
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COALESCE(ur.name, 'member')
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.name = role_name
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_access_course(user_id uuid, course_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_restricted BOOLEAN;
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.course_access_control 
    WHERE course_access_control.course_id = $2
  ) INTO is_restricted;
  
  IF NOT is_restricted THEN
    RETURN TRUE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = $1 AND ur.name = 'admin'
  ) INTO has_access;
  
  IF has_access THEN
    RETURN TRUE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.course_access_control cac ON p.role_id = cac.role_id
    WHERE p.id = $1 AND cac.course_id = $2
  ) INTO has_access;
  
  RETURN has_access;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_access_benefit(user_id uuid, tool_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_restricted BOOLEAN;
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.benefit_access_control 
    WHERE benefit_access_control.tool_id = $2
  ) INTO is_restricted;
  
  IF NOT is_restricted THEN
    RETURN TRUE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = $1 AND ur.name = 'admin'
  ) INTO has_access;
  
  IF has_access THEN
    RETURN TRUE;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    JOIN public.benefit_access_control bac ON p.role_id = bac.role_id
    WHERE p.id = $1 AND bac.tool_id = $2
  ) INTO has_access;
  
  RETURN has_access;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_visible_events_for_user(user_id uuid)
RETURNS SETOF public.events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  is_user_admin BOOLEAN;
  user_role_id UUID;
BEGIN
  SELECT public.is_admin() INTO is_user_admin;
  
  IF is_user_admin THEN
    RETURN QUERY SELECT * FROM public.events ORDER BY start_time ASC;
    RETURN;
  END IF;
  
  SELECT role_id INTO user_role_id FROM public.profiles WHERE id = user_id;
  
  RETURN QUERY 
  SELECT e.* FROM public.events e
  WHERE 
    NOT EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id)
    OR
    EXISTS (SELECT 1 FROM public.event_access_control eac WHERE eac.event_id = e.id AND eac.role_id = user_role_id)
  ORDER BY e.start_time ASC;
END;
$function$;

-- Log da correção fase 2
INSERT INTO public.audit_logs (
  user_id,
  event_type,
  action,
  details
) VALUES (
  auth.uid(),
  'security_fix',
  'function_search_path_fix_phase2',
  jsonb_build_object(
    'functions_fixed', 12,
    'security_improvement', 'Added SET search_path for security functions',
    'phase', 2,
    'timestamp', NOW()
  )
);