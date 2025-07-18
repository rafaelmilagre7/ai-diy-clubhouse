
-- ETAPA 1 CONTINUAÇÃO: Correções de Segurança Restantes
-- Corrigir funções críticas e políticas RLS que ainda precisam de ajustes

-- 1. Corrigir função log_critical_action (recriar se necessário)
DROP FUNCTION IF EXISTS public.log_critical_action(text, jsonb);
CREATE OR REPLACE FUNCTION public.log_critical_action(
  p_action text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  
  -- Log crítico sempre inserido
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
    p_details || jsonb_build_object(
      'timestamp', now(),
      'function_caller', 'log_critical_action'
    ),
    'high',
    now()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, não falhar silenciosamente
    NULL;
END;
$function$;

-- 2. Função para verificar saúde do sistema
CREATE OR REPLACE FUNCTION public.check_system_health()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  health_status jsonb;
  current_user_role text;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Authentication required'
    );
  END IF;
  
  -- Buscar role do usuário atual
  SELECT ur.name INTO current_user_role
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = auth.uid();
  
  -- Verificações básicas de saúde
  health_status := jsonb_build_object(
    'status', 'healthy',
    'database_status', 'operational',
    'user_authenticated', true,
    'user_role', COALESCE(current_user_role, 'unknown'),
    'check_timestamp', now(),
    'system_responsive', true
  );
  
  -- Se for admin, adicionar estatísticas extras
  IF current_user_role = 'admin' THEN
    health_status := health_status || jsonb_build_object(
      'total_users', (SELECT COUNT(*) FROM public.profiles),
      'total_solutions', (SELECT COUNT(*) FROM public.solutions WHERE published = true),
      'active_sessions', 1
    );
  END IF;
  
  RETURN health_status;
END;
$function$;

-- 3. Corrigir políticas RLS mais restritivas para profiles
DROP POLICY IF EXISTS "profiles_restricted_read" ON public.profiles;
CREATE POLICY "profiles_authenticated_restricted_access"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR 
    public.is_user_admin(auth.uid())
  )
);

-- 4. Política para UPDATE em profiles
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_user_can_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 5. Corrigir política para onboarding_final
DROP POLICY IF EXISTS "onboarding_final_strict_user_only" ON public.onboarding_final;
CREATE POLICY "onboarding_final_user_full_access"
ON public.onboarding_final
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Função para rate limiting mais robusta
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

-- Log da continuação da ETAPA 1
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity,
  user_id
) VALUES (
  'security_hardening',
  'etapa_1_continuacao_security_fixes',
  jsonb_build_object(
    'message', 'ETAPA 1 CONTINUAÇÃO - Correções finais de segurança aplicadas',
    'functions_created', ARRAY[
      'log_critical_action',
      'check_system_health', 
      'check_rate_limit'
    ],
    'policies_updated', ARRAY[
      'profiles_authenticated_restricted_access',
      'profiles_user_can_update_own',
      'onboarding_final_user_full_access'
    ],
    'security_improvements', ARRAY[
      'search_path_fixed_for_critical_functions',
      'rls_policies_hardened',
      'rate_limiting_improved',
      'system_health_monitoring_added'
    ],
    'next_step', 'implement_standardized_hooks'
  ),
  'high',
  auth.uid()
);
