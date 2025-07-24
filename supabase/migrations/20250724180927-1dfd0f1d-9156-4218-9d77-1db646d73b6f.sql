-- CORREÇÕES DE SEGURANÇA CRÍTICAS
-- Fase 1: Corrigir search_path em funções críticas de segurança

-- 1. Corrigir função de validação de admin
CREATE OR REPLACE FUNCTION public.is_user_admin_secure(target_user_id uuid DEFAULT auth.uid())
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

-- 2. Corrigir função de role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role_secure(target_user_id uuid DEFAULT auth.uid())
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role_name text;
  user_email text;
BEGIN
  IF target_user_id IS NULL THEN
    RETURN 'anonymous';
  END IF;
  
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_role_name IS NOT NULL THEN
    RETURN user_role_name;
  END IF;
  
  SELECT p.email INTO user_email
  FROM public.profiles p
  WHERE p.id = target_user_id
  LIMIT 1;
  
  IF user_email IS NOT NULL AND user_email LIKE '%@viverdeia.ai' THEN
    RETURN 'admin';
  END IF;
  
  RETURN 'member';
END;
$function$;

-- 3. Corrigir função de acesso a conteúdo de aprendizado
CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.get_user_role_secure(target_user_id) IN ('admin', 'membro_club', 'formacao');
$function$;

-- 4. Corrigir função de log de segurança
CREATE OR REPLACE FUNCTION public.log_security_violation(violation_type text, resource_table text, attempted_action text, user_context jsonb DEFAULT '{}'::jsonb)
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
    'security_violation',
    attempted_action,
    resource_table,
    jsonb_build_object(
      'violation_type', violation_type,
      'table', resource_table,
      'user_context', user_context,
      'timestamp', NOW(),
      'session_info', jsonb_build_object(
        'role', public.get_user_role_secure(),
        'user_id', auth.uid()
      )
    ),
    'high'
  );
END;
$function$;

-- 5. Corrigir função de rate limiting
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

-- 6. Criar tabela para rate limiting se não existir
CREATE TABLE IF NOT EXISTS public.rate_limit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  blocked_until timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(identifier, action)
);

-- 7. RLS para rate_limit_blocks
ALTER TABLE public.rate_limit_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limit_blocks_system_only" ON public.rate_limit_blocks
FOR ALL USING (auth.role() = 'service_role');

-- 8. Corrigir funções de audit log
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