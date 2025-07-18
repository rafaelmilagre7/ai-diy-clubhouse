-- FASE 2 CORRIGIDA: CORREÇÃO DAS DEMAIS FUNÇÕES CRÍTICAS E POLÍTICAS RLS

-- 1. Primeiro remover função conflitante
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);

-- 2. Corrigir funções restantes com search_path inseguro
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

-- 3. Função de cleanup segura
CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
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

-- 4. Função para validar token de convite
CREATE OR REPLACE FUNCTION public.validate_invite_token(token_value text)
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

-- 5. Função para verificar permissões sem conflito de parâmetros
CREATE OR REPLACE FUNCTION public.check_user_permission(target_user_id uuid, permission_code text)
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

-- 6. Trigger para log automático de mudanças críticas
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log mudanças de role
  IF TG_OP = 'UPDATE' AND OLD.role_id IS DISTINCT FROM NEW.role_id THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      NEW.id,
      'profile_change',
      'role_updated',
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'changed_by', auth.uid()
      ),
      'high'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Aplicar trigger nos profiles
DROP TRIGGER IF EXISTS profile_changes_audit ON public.profiles;
CREATE TRIGGER profile_changes_audit
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();

-- 7. Corrigir políticas RLS muito permissivas
DROP POLICY IF EXISTS "admin_settings_authenticated_admin_only" ON public.admin_settings;
CREATE POLICY "admin_settings_admin_only"
ON public.admin_settings
FOR ALL
TO authenticated
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- 8. Política mais restritiva para audit_logs
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

-- Política de insert mais restritiva para audit_logs
DROP POLICY IF EXISTS "audit_logs_secure_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_secure_insert"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    auth.role() = 'service_role'
  )
);

-- 9. Consolidar políticas de communication_preferences
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

-- 10. Log da Fase 2 completada
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity,
  user_id
) VALUES (
  'security_fix',
  'phase_2_completed_corrected',
  jsonb_build_object(
    'message', 'FASE 2 CORRIGIDA - Funções críticas e políticas RLS corrigidas',
    'actions_completed', ARRAY[
      'search_path_fixed_remaining_functions',
      'rls_policies_hardened',
      'audit_triggers_implemented',
      'permission_system_enhanced',
      'function_conflicts_resolved'
    ],
    'functions_fixed', ARRAY[
      'is_admin', 'is_admin_user', 'cleanup_old_analytics', 
      'validate_invite_token', 'check_user_permission', 'log_profile_changes'
    ],
    'policies_updated', ARRAY[
      'admin_settings_admin_only', 'audit_logs_restricted_access',
      'communication_preferences_admin_access', 'communication_preferences_user_access'
    ],
    'timestamp', now()
  ),
  'high',
  auth.uid()
);