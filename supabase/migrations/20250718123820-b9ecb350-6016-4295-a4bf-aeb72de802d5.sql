
-- FASE 1: CORREÇÃO DE FUNÇÕES CRÍTICAS COM SEARCH_PATH INSEGURO
-- Corrigindo as 20 funções mais críticas primeiro

-- 1. Corrigir constraint de audit_logs que está causando erro
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_severity_check;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_severity_check 
CHECK (severity IN ('low', 'medium', 'high', 'critical', 'info', 'warning', 'error'));

-- 2. Funções de timestamp com search_path corrigido
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

-- 3. Funções de rate limiting com search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_action text, p_limit_per_hour integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Contar tentativas na última hora
  SELECT COUNT(*) INTO v_count
  FROM public.audit_logs
  WHERE user_id = auth.uid()
    AND action = p_action
    AND timestamp > NOW() - INTERVAL '1 hour';
  
  -- Se excedeu o limite, retornar false
  IF v_count >= p_limit_per_hour THEN
    RETURN false;
  END IF;
  
  -- Registrar tentativa apenas se usuário autenticado
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'rate_limit_check',
      p_action,
      jsonb_build_object('count', v_count + 1, 'limit', p_limit_per_hour),
      'info'
    );
  END IF;
  
  RETURN true;
END;
$function$;

-- 4. Função log_security_access melhorada
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
  -- Log robusto que não falha silenciosamente
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
        'timestamp', NOW(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
      ),
      'info'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar, registrar pelo menos no sistema
      RAISE NOTICE '[SECURITY] Falha ao registrar log: % para tabela %', SQLERRM, p_table_name;
  END;
END;
$function$;

-- 5. Função generate_invite_token com search_path
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

-- 6. Função generate_certificate_validation_code corrigida
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

-- 7. Corrigir função is_user_admin para ser mais robusta
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id 
    AND ur.name = 'admin'
  );
END;
$function$;

-- 8. Cleanup de rate limits expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Limpar tentativas antigas de rate limit (mais de 24 horas)
  DELETE FROM public.audit_logs
  WHERE event_type = 'rate_limit_check'
  AND timestamp < now() - interval '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$function$;

-- 9. Função para verificar permissões de usuário
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

-- 10. Log da correção
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity,
  user_id
) VALUES (
  'security_fix',
  'critical_functions_repaired',
  jsonb_build_object(
    'message', 'FASE 1 - Correção de funções críticas com search_path inseguro',
    'functions_fixed', ARRAY[
      'update_updated_at_column', 'update_conversations_timestamp', 'check_rate_limit',
      'log_security_access', 'generate_invite_token', 'generate_certificate_validation_code',
      'is_user_admin', 'cleanup_expired_rate_limits', 'user_has_permission'
    ],
    'audit_logs_constraint_fixed', true,
    'timestamp', now()
  ),
  'high',
  auth.uid()
);
