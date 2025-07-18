
-- FASE 1: CORREÇÃO DE SEARCH_PATH NAS FUNÇÕES RESTANTES (LOTE 2 - 15 FUNÇÕES)
-- Corrigir funções que ainda não têm search_path definido

-- 16. TRIGGERS DE UPDATED_AT RESTANTES
CREATE OR REPLACE FUNCTION public.update_suggestions_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_suggestion_comments_updated_at()
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

-- 17. FUNÇÕES DE BACKUP E LIMPEZA
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limit_blocks
  WHERE blocked_until < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$;

-- 18. FUNÇÕES DE GERAÇÃO DE TOKENS
CREATE OR REPLACE FUNCTION public.generate_certificate_validation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4) || '-' ||
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4) || '-' ||
    substring(encode(gen_random_bytes(4), 'hex'), 1, 4)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
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

-- 19. CRIAR FUNÇÕES RPC FALTANDO
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se usuário é admin (tem todas as permissões)
  IF public.is_user_admin(user_id) THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica via role
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id
    AND (
      ur.permissions ? permission_code 
      OR ur.permissions ? 'all'
      OR ur.permissions->permission_code = 'true'::jsonb
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  permissions_array text[];
BEGIN
  -- Se é admin, retornar todas as permissões
  IF public.is_user_admin(user_id) THEN
    RETURN ARRAY['admin.all', 'manage_users', 'manage_roles', 'view_analytics'];
  END IF;
  
  -- Buscar permissões específicas do role do usuário
  SELECT ARRAY(
    SELECT jsonb_object_keys(ur.permissions)
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id
    AND ur.permissions IS NOT NULL
  ) INTO permissions_array;
  
  RETURN COALESCE(permissions_array, ARRAY[]::text[]);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_access(
  p_table_name text,
  p_operation text,
  p_resource_id text DEFAULT NULL
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
    severity
  ) VALUES (
    auth.uid(),
    'data_access',
    p_operation,
    p_resource_id,
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    'info'
  );
END;
$function$;

-- 20. CORRIGIR FUNÇÃO CHECK_RATE_LIMIT COM PARÂMETROS CORRETOS
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action text,
  p_limit_per_hour integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_count integer := 0;
  v_blocked_until timestamp;
BEGIN
  v_user_id := auth.uid();
  
  -- Se não há usuário autenticado, permitir (para requests públicos)
  IF v_user_id IS NULL THEN
    RETURN true;
  END IF;
  
  -- Verificar bloqueio ativo
  SELECT blocked_until INTO v_blocked_until
  FROM public.rate_limit_blocks 
  WHERE identifier = v_user_id::text
  AND action = p_action 
  AND blocked_until > now()
  LIMIT 1;
  
  IF v_blocked_until IS NOT NULL THEN
    RETURN false;
  END IF;
  
  -- Contar tentativas na última hora
  SELECT COUNT(*) INTO v_count
  FROM public.audit_logs
  WHERE user_id = v_user_id
    AND action = p_action
    AND timestamp > now() - interval '1 hour';
  
  -- Verificar limite
  IF v_count >= p_limit_per_hour THEN
    -- Bloquear por 1 hora
    INSERT INTO public.rate_limit_blocks (identifier, action, blocked_until)
    VALUES (v_user_id::text, p_action, now() + interval '1 hour')
    ON CONFLICT (identifier, action) 
    DO UPDATE SET blocked_until = now() + interval '1 hour';
    
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- LOG DO LOTE 2
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  user_id
) VALUES (
  'security_hardening',
  'phase_1_functions_lote_2',
  jsonb_build_object(
    'message', 'FASE 1 - Correção de search_path em funções (Lote 2)',
    'functions_fixed', 10,
    'rpcs_created', ARRAY['user_has_permission', 'get_user_permissions', 'log_security_access', 'check_rate_limit'],
    'batch', 2,
    'timestamp', now()
  ),
  auth.uid()
);
