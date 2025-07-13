-- Correções críticas de segurança - Prevenir escalação de privilégios
-- Fix 1: Atualizar política RLS para prevenir usuários de mudarem seu próprio role_id

-- Remover política atual que permite auto-atualização irrestrita
DROP POLICY IF EXISTS "consolidated_profiles_update_policy" ON public.profiles;

-- Criar políticas separadas: uma para campos gerais e outra para role_id
CREATE POLICY "users_can_update_own_profile_general" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND 
  -- Prevenir mudança de role_id, role, email pelos próprios usuários
  (role_id IS NOT DISTINCT FROM (SELECT role_id FROM public.profiles WHERE id = auth.uid())) AND
  (role IS NOT DISTINCT FROM (SELECT role FROM public.profiles WHERE id = auth.uid())) AND
  (email IS NOT DISTINCT FROM (SELECT email FROM public.profiles WHERE id = auth.uid()))
);

CREATE POLICY "admins_can_update_any_profile" 
ON public.profiles 
FOR UPDATE 
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Fix 2: Função segura para validação de mudanças de papel
CREATE OR REPLACE FUNCTION public.validate_role_change(
  target_user_id UUID,
  new_role_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_role TEXT;
  target_new_role TEXT;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT is_user_admin(auth.uid()) THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar o nome do novo papel
  SELECT name INTO target_new_role
  FROM public.user_roles 
  WHERE id = new_role_id;
  
  -- Log da tentativa de mudança de papel
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    auth.uid(),
    'role_change_attempt',
    'validate_role_change',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'new_role_id', new_role_id,
      'new_role_name', target_new_role,
      'authorized', TRUE
    )
  );
  
  RETURN TRUE;
END;
$$;

-- Fix 3: RPC segura para atribuição de papéis
CREATE OR REPLACE FUNCTION public.secure_assign_role(
  target_user_id UUID,
  new_role_id UUID
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_role_name TEXT;
  old_role_name TEXT;
  result jsonb;
BEGIN
  -- Validar se a mudança é permitida
  IF NOT validate_role_change(target_user_id, new_role_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Não autorizado para alterar papéis',
      'error_code', 'UNAUTHORIZED'
    );
  END IF;
  
  -- Verificar se o usuário alvo existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Usuário não encontrado',
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;
  
  -- Verificar se o novo papel existe
  SELECT name INTO new_role_name
  FROM public.user_roles 
  WHERE id = new_role_id;
  
  IF new_role_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Papel não encontrado',
      'error_code', 'ROLE_NOT_FOUND'
    );
  END IF;
  
  -- Buscar papel atual para log
  SELECT ur.name INTO old_role_name
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Executar a mudança de papel
  UPDATE public.profiles 
  SET 
    role_id = new_role_id,
    role = new_role_name,
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log de auditoria da mudança executada
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details
  ) VALUES (
    auth.uid(),
    'role_change',
    'secure_assign_role',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'old_role_name', old_role_name,
      'new_role_name', new_role_name,
      'new_role_id', new_role_id,
      'timestamp', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Papel atribuído com sucesso',
    'old_role', old_role_name,
    'new_role', new_role_name
  );
END;
$$;

-- Fix 4: Política adicional para user_roles para prevenir manipulação direta
DROP POLICY IF EXISTS "user_roles_admin_policy" ON public.user_roles;

CREATE POLICY "only_admins_can_manage_roles" 
ON public.user_roles 
FOR ALL 
USING (is_user_admin(auth.uid()))
WITH CHECK (is_user_admin(auth.uid()));

-- Fix 5: Função para log de tentativas de escalação de privilégios
CREATE OR REPLACE FUNCTION public.log_privilege_escalation_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log tentativas de mudança não autorizadas de papel
  IF OLD.role_id IS DISTINCT FROM NEW.role_id AND NEW.id = auth.uid() THEN
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      auth.uid(),
      'security_violation',
      'privilege_escalation_attempt',
      jsonb_build_object(
        'attempted_role_change', true,
        'old_role_id', OLD.role_id,
        'new_role_id', NEW.role_id,
        'user_id', NEW.id,
        'timestamp', now()
      ),
      'critical'
    );
    
    -- Prevenir a mudança rejeitando a operação
    RAISE EXCEPTION 'Mudança de papel não autorizada detectada';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Adicionar trigger para detectar tentativas de escalação
CREATE TRIGGER prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_attempt();

-- Log da implementação das correções
INSERT INTO public.audit_logs (
  event_type,
  action,
  details
) VALUES (
  'security_improvement',
  'critical_security_fixes_implemented',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'role_escalation_prevention',
      'secure_role_assignment_rpc',
      'enhanced_rls_policies',
      'privilege_escalation_detection',
      'comprehensive_audit_logging'
    ],
    'security_level', 'CRITICAL',
    'status', 'COMPLETED'
  )
);