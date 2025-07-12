-- ========================================================================
-- CRÍTICAS CORREÇÕES DE SEGURANÇA - FASE 1
-- ========================================================================

-- 1. CONSOLIDAR POLÍTICAS RLS CONFLITANTES NA TABELA PROFILES
-- Remover políticas conflitantes e duplicadas

DROP POLICY IF EXISTS "Prevent unauthorized role changes" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "secure_profiles_update_policy" ON public.profiles;

-- Criar política consolidada e robusta para UPDATE
CREATE POLICY "consolidated_profiles_update_policy" ON public.profiles
  FOR UPDATE 
  USING (
    -- Usuário pode atualizar apenas seu próprio perfil
    auth.uid() = id
    OR 
    -- Apenas admins podem alterar qualquer perfil
    is_user_admin(auth.uid())
  )
  WITH CHECK (
    -- Verificações adicionais para mudanças de role
    (auth.uid() = id OR is_user_admin(auth.uid()))
    AND
    -- Validação especial para mudanças de role_id
    (
      role_id IS NOT DISTINCT FROM (SELECT role_id FROM public.profiles WHERE id = auth.uid())
      OR 
      validate_role_change(id, role_id, auth.uid())
    )
  );

-- 2. FORTALECER FUNÇÃO validate_role_change COM VALIDAÇÕES ADICIONAIS
CREATE OR REPLACE FUNCTION public.validate_role_change(
  target_user_id uuid, 
  new_role_id uuid, 
  current_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role_name TEXT;
  target_current_role_name TEXT;
  new_role_name TEXT;
  is_admin BOOLEAN := FALSE;
BEGIN
  -- Log da tentativa de mudança de role
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    current_user_id,
    'role_change_attempt',
    'validate_role_change',
    target_user_id::text,
    jsonb_build_object(
      'target_user_id', target_user_id,
      'new_role_id', new_role_id,
      'current_user_id', current_user_id,
      'timestamp', NOW()
    ),
    'medium'
  );

  -- Verificar se o usuário atual é admin
  SELECT EXISTS(
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_roles ur ON p.role_id = ur.id
    WHERE p.id = current_user_id AND ur.name = 'admin'
  ) INTO is_admin;
  
  -- Buscar role atual do usuário que está fazendo a mudança
  SELECT ur.name INTO current_user_role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = current_user_id;
  
  -- Buscar role atual do usuário alvo
  SELECT ur.name INTO target_current_role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Buscar nome do novo role
  SELECT name INTO new_role_name
  FROM public.user_roles
  WHERE id = new_role_id;
  
  -- REGRA 1: Apenas admins podem alterar papéis de outros usuários
  IF target_user_id != current_user_id AND NOT is_admin THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, resource_id, details, severity
    ) VALUES (
      current_user_id, 'security_violation', 'unauthorized_role_change_attempt',
      target_user_id::text,
      jsonb_build_object(
        'violation_type', 'non_admin_user_trying_to_change_other_user_role',
        'current_user_role', current_user_role_name,
        'target_user_role', target_current_role_name,
        'attempted_new_role', new_role_name
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- REGRA 2: Usuários não-admin não podem se promover para admin
  IF target_user_id = current_user_id AND NOT is_admin THEN
    IF new_role_name = 'admin' THEN
      INSERT INTO public.audit_logs (
        user_id, event_type, action, resource_id, details, severity
      ) VALUES (
        current_user_id, 'security_violation', 'self_promotion_attempt',
        target_user_id::text,
        jsonb_build_object(
          'violation_type', 'non_admin_attempting_self_promotion',
          'current_role', current_user_role_name,
          'attempted_role', 'admin'
        ),
        'critical'
      );
      RETURN FALSE;
    END IF;
  END IF;
  
  -- REGRA 3: Não permitir mudanças para roles inexistentes
  IF new_role_name IS NULL THEN
    INSERT INTO public.audit_logs (
      user_id, event_type, action, resource_id, details, severity
    ) VALUES (
      current_user_id, 'security_violation', 'invalid_role_assignment',
      target_user_id::text,
      jsonb_build_object(
        'violation_type', 'attempt_to_assign_non_existent_role',
        'invalid_role_id', new_role_id
      ),
      'high'
    );
    RETURN FALSE;
  END IF;
  
  -- Log de validação bem-sucedida
  INSERT INTO public.audit_logs (
    user_id, event_type, action, resource_id, details, severity
  ) VALUES (
    current_user_id, 'role_change_validation', 'role_change_approved',
    target_user_id::text,
    jsonb_build_object(
      'current_user_role', current_user_role_name,
      'target_current_role', target_current_role_name,
      'new_role', new_role_name,
      'validation_passed', true
    ),
    'low'
  );
  
  RETURN TRUE;
END;
$$;

-- 3. CRIAR FUNÇÃO PARA VALIDAÇÃO DE ADMIN EM EDGE FUNCTIONS
CREATE OR REPLACE FUNCTION public.validate_admin_access(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_name TEXT;
  is_admin_user BOOLEAN := FALSE;
BEGIN
  -- Buscar role do usuário
  SELECT ur.name INTO user_role_name
  FROM public.profiles p
  JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
  
  -- Verificar se é admin
  is_admin_user := (user_role_name = 'admin');
  
  -- Log da tentativa de acesso admin
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    user_id,
    'admin_access_attempt',
    'validate_admin_access',
    jsonb_build_object(
      'user_role', user_role_name,
      'access_granted', is_admin_user,
      'timestamp', NOW()
    ),
    CASE WHEN is_admin_user THEN 'low' ELSE 'medium' END
  );
  
  RETURN jsonb_build_object(
    'is_admin', is_admin_user,
    'user_role', user_role_name,
    'user_id', user_id
  );
END;
$$;