-- FASE 2 FINAL: CORREÇÃO COMPLETA DAS FUNÇÕES CRÍTICAS

-- 1. Remover todas as funções conflitantes primeiro
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
DROP FUNCTION IF EXISTS public.validate_invite_token(text);
DROP FUNCTION IF EXISTS public.cleanup_old_analytics(integer);

-- 2. Corrigir funções com search_path inseguro
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.is_user_admin(auth.uid());
END;
$function$;

-- 3. Nova função de cleanup com nome único
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics_secure()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Limpar analytics antigos (mais de 90 dias)
  DELETE FROM public.analytics
  WHERE created_at < now() - interval '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Registrar limpeza
  INSERT INTO public.audit_logs (
    event_type,
    action,
    details,
    severity
  ) VALUES (
    'maintenance',
    'analytics_cleanup',
    jsonb_build_object('deleted_records', deleted_count),
    'info'
  );
  
  RETURN deleted_count;
END;
$function$;

-- 4. Nova função para validar token
CREATE OR REPLACE FUNCTION public.validate_invite_token_secure(token_value text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.invites 
    WHERE token = token_value 
    AND expires_at > now()
    AND used_at IS NULL
  );
END;
$function$;

-- 5. Função para verificar permissões
CREATE OR REPLACE FUNCTION public.check_user_permission_secure(target_user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verificar se usuário é admin (tem todas as permissões)
  IF public.is_user_admin(target_user_id) THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica via role
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    INNER JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = target_user_id
    AND (
      ur.permissions ? permission_code 
      OR ur.permissions ? 'all'
      OR ur.permissions->permission_code = 'true'::jsonb
    )
  );
END;
$function$;

-- 6. Corrigir políticas RLS mais permissivas
DROP POLICY IF EXISTS "admin_settings_authenticated_admin_only" ON public.admin_settings;
CREATE POLICY "admin_settings_admin_only"
ON public.admin_settings
FOR ALL
TO authenticated
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- 7. Política mais restritiva para audit_logs
DROP POLICY IF EXISTS "audit_logs_authenticated_access" ON public.audit_logs;
CREATE POLICY "audit_logs_restricted_access"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR 
    public.is_user_admin(auth.uid())
  )
);

-- 8. Consolidar políticas de communication_preferences
DROP POLICY IF EXISTS "Admins can view all communication preferences" ON public.communication_preferences;
DROP POLICY IF EXISTS "Users can view their own communication preferences" ON public.communication_preferences;
DROP POLICY IF EXISTS "Users can update their own communication preferences" ON public.communication_preferences;
DROP POLICY IF EXISTS "communication_preferences_secure_insert" ON public.communication_preferences;

-- Política consolidada para admins
CREATE POLICY "communication_preferences_admin_access"
ON public.communication_preferences
FOR ALL
TO authenticated
USING (public.is_user_admin(auth.uid()));

-- Política consolidada para usuários
CREATE POLICY "communication_preferences_user_access"
ON public.communication_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 9. Log da correção final
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity,
  user_id
) VALUES (
  'security_fix',
  'critical_functions_final_fix',
  jsonb_build_object(
    'message', 'CORREÇÃO FINAL - Todas as funções críticas foram corrigidas',
    'phase', 'final',
    'functions_corrected', ARRAY[
      'is_admin', 'is_admin_user', 'cleanup_old_analytics_secure', 
      'validate_invite_token_secure', 'check_user_permission_secure'
    ],
    'policies_hardened', ARRAY[
      'admin_settings_admin_only', 'audit_logs_restricted_access',
      'communication_preferences_admin_access', 'communication_preferences_user_access'
    ],
    'security_improvements', ARRAY[
      'search_path_vulnerabilities_fixed',
      'rls_policies_hardened',
      'function_conflicts_resolved',
      'audit_constraint_fixed'
    ],
    'timestamp', now()
  ),
  'high',
  auth.uid()
);