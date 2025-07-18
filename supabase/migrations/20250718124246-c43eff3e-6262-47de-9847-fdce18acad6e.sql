-- FASE 2: CORREÇÃO DAS DEMAIS FUNÇÕES CRÍTICAS E POLÍTICAS RLS

-- 1. Corrigir funções restantes com search_path inseguro
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

-- 2. Função para obter permissões do usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_permissions text[];
BEGIN
  -- Se usuário é admin, retornar todas as permissões
  IF public.is_user_admin(user_id) THEN
    RETURN ARRAY['admin.all', 'users.read', 'users.write', 'content.read', 'content.write', 'analytics.read'];
  END IF;
  
  -- Buscar permissões específicas do role
  SELECT COALESCE(
    array_agg(DISTINCT perm_key), 
    ARRAY[]::text[]
  ) INTO user_permissions
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  CROSS JOIN LATERAL jsonb_object_keys(ur.permissions) AS perm_key
  WHERE p.id = user_id 
  AND ur.permissions->perm_key = 'true'::jsonb;
  
  RETURN COALESCE(user_permissions, ARRAY[]::text[]);
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

-- 4. Corrigir políticas RLS muito permissivas - começando com tabelas críticas

-- Política mais restritiva para admin_settings
DROP POLICY IF EXISTS "admin_settings_authenticated_admin_only" ON public.admin_settings;
CREATE POLICY "admin_settings_admin_only"
ON public.admin_settings
FOR ALL
TO authenticated
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- Política mais restritiva para audit_logs
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

-- 5. Corrigir políticas de communication_preferences
DROP POLICY IF EXISTS "Admins can view all communication preferences" ON public.communication_preferences;
CREATE POLICY "communication_preferences_admin_access"
ON public.communication_preferences
FOR ALL
TO authenticated
USING (public.is_user_admin(auth.uid()));

-- Política de usuário para communication_preferences
DROP POLICY IF EXISTS "Users can view their own communication preferences" ON public.communication_preferences;
DROP POLICY IF EXISTS "Users can update their own communication preferences" ON public.communication_preferences;
CREATE POLICY "communication_preferences_user_access"
ON public.communication_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Função para validar token de convite
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

-- 7. Trigger para log automático de mudanças críticas
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

-- 8. Log da Fase 2
INSERT INTO public.audit_logs (
  event_type,
  action,
  details,
  severity,
  user_id
) VALUES (
  'security_fix',
  'phase_2_completed',
  jsonb_build_object(
    'message', 'FASE 2 - Correção de funções restantes e políticas RLS',
    'actions_completed', ARRAY[
      'search_path_fixed_remaining_functions',
      'rls_policies_hardened',
      'audit_triggers_implemented',
      'permission_system_enhanced'
    ],
    'functions_added', ARRAY[
      'get_user_permissions', 'cleanup_old_analytics', 'validate_invite_token', 'log_profile_changes'
    ],
    'timestamp', now()
  ),
  'high',
  auth.uid()
);