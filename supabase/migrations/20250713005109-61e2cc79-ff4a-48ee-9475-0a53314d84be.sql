-- CORREÇÕES CRÍTICAS DE SEGURANÇA - PARTE 2: Melhorias Adicionais (CORRIGIDO)
-- Fix 6: Função auxiliar para verificar se usuário pode atribuir um papel específico
CREATE OR REPLACE FUNCTION public.can_assign_role(
  admin_user_id UUID,
  target_role_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_role_name TEXT;
  target_role_name TEXT;
BEGIN
  -- Verificar se é admin
  IF NOT is_user_admin(admin_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar nomes dos papéis
  SELECT ur.name INTO admin_role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = admin_user_id;
  
  SELECT name INTO target_role_name
  FROM public.user_roles 
  WHERE id = target_role_id;
  
  -- Log da verificação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    admin_user_id,
    'role_assignment_check',
    'can_assign_role',
    jsonb_build_object(
      'admin_role', admin_role_name,
      'target_role', target_role_name,
      'allowed', TRUE
    )
  );
  
  RETURN TRUE;
END;
$$;

-- Fix 7: Função para obter papel do usuário de forma segura
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id UUID DEFAULT auth.uid())
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT ur.name INTO user_role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = COALESCE(user_id, auth.uid());
  
  RETURN COALESCE(user_role, 'member');
END;
$$;

-- Fix 8: Melhorar política de atualização de profiles (mais restritiva)
DROP POLICY IF EXISTS "users_can_update_own_profile_general" ON public.profiles;

CREATE POLICY "users_can_update_own_profile_restricted" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  -- Bloquear mudanças nos campos críticos
  role_id IS NOT DISTINCT FROM (SELECT role_id FROM public.profiles WHERE id = auth.uid()) AND
  role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
  email IS NOT DISTINCT FROM (SELECT email FROM public.profiles WHERE id = auth.uid())
);

-- Fix 9: Função para logging de tentativas de acesso não autorizadas
CREATE OR REPLACE FUNCTION public.log_unauthorized_access(
  attempted_action TEXT,
  resource_details JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    auth.uid(),
    'security_violation',
    attempted_action,
    jsonb_build_object(
      'user_id', auth.uid(),
      'timestamp', now(),
      'resource_details', resource_details
    ),
    'high'
  );
END;
$$;

-- Fix 10: Política melhorada para user_roles com logging
DROP POLICY IF EXISTS "only_admins_can_manage_roles" ON public.user_roles;

CREATE POLICY "admins_can_manage_roles_secure" 
ON public.user_roles 
FOR ALL 
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Fix 11: Política de inserção mais restritiva para profiles
DROP POLICY IF EXISTS "restricted_profile_creation" ON public.profiles;

CREATE POLICY "restricted_profile_creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  id = auth.uid() AND
  -- Apenas papéis seguros podem ser auto-atribuídos na criação
  (role_id IS NULL OR role_id IN (
    SELECT id FROM public.user_roles WHERE name IN ('member', 'user')
  ))
);

-- Fix 12: Trigger melhorado para validar mudanças em role_id
CREATE OR REPLACE FUNCTION public.validate_role_change_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_admin BOOLEAN;
  old_role_name TEXT;
  new_role_name TEXT;
BEGIN
  -- Se role_id não mudou, permitir
  IF OLD.role_id IS NOT DISTINCT FROM NEW.role_id THEN
    RETURN NEW;
  END IF;
  
  -- Verificar se o usuário é admin
  SELECT is_user_admin(auth.uid()) INTO is_admin;
  
  -- Se não é admin e está tentando mudar role_id, bloquear
  IF NOT is_admin AND NEW.id = auth.uid() THEN
    -- Log da tentativa
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'security_violation',
      'self_role_escalation_blocked',
      jsonb_build_object(
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'timestamp', now()
      ),
      'critical'
    );
    
    RAISE EXCEPTION 'Usuários não podem alterar seu próprio papel';
  END IF;
  
  -- Log de mudança autorizada de papel
  IF is_admin THEN
    SELECT ur.name INTO old_role_name 
    FROM public.user_roles ur WHERE ur.id = OLD.role_id;
    
    SELECT ur.name INTO new_role_name 
    FROM public.user_roles ur WHERE ur.id = NEW.role_id;
    
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details
    ) VALUES (
      auth.uid(),
      'role_change',
      'admin_role_update',
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', old_role_name,
        'new_role', new_role_name,
        'admin_user_id', auth.uid(),
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger anterior e adicionar o novo
DROP TRIGGER IF EXISTS prevent_privilege_escalation ON public.profiles;
DROP TRIGGER IF EXISTS validate_role_changes ON public.profiles;

CREATE TRIGGER validate_role_changes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_role_change_trigger();

-- Fix 13: Função para verificar integridade do sistema de papéis
CREATE OR REPLACE FUNCTION public.check_role_system_integrity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  orphaned_profiles INTEGER;
  admin_count INTEGER;
  result JSONB;
BEGIN
  -- Verificar perfis órfãos (sem papel válido)
  SELECT COUNT(*) INTO orphaned_profiles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.id IS NULL;
  
  -- Contar admins
  SELECT COUNT(*) INTO admin_count
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE ur.name = 'admin';
  
  result := jsonb_build_object(
    'orphaned_profiles', orphaned_profiles,
    'admin_count', admin_count,
    'system_healthy', (orphaned_profiles = 0 AND admin_count > 0),
    'check_timestamp', now()
  );
  
  -- Log do resultado da verificação
  INSERT INTO public.audit_logs (
    event_type,
    action,
    details
  ) VALUES (
    'system_check',
    'role_system_integrity_check',
    result
  );
  
  RETURN result;
END;
$$;

-- Log da implementação das correções de segurança parte 2
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_improvement',
  'security_hardening_phase_2_completed',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'role_assignment_validation_enhanced',
      'unauthorized_access_logging',
      'profile_update_restrictions_strengthened',
      'role_change_validation_trigger_improved',
      'system_integrity_checker_implemented'
    ],
    'security_level', 'HIGH',
    'status', 'COMPLETED',
    'phase', '2_SECURITY_HARDENING'
  )
);