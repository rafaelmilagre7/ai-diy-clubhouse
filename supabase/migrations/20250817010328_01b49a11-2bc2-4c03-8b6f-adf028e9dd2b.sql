-- CORREÇÃO CRÍTICA: Revogar acesso anônimo a funções sensíveis e adicionar verificação de autorização

-- 1. Revogar permissões anônimas em funções críticas
REVOKE EXECUTE ON FUNCTION public.get_user_profile_optimized_secure(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_role_secure(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_user_admin_secure(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_learning_content(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_course_enhanced(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.secure_change_user_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.secure_create_role(text, text, boolean, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enhanced_security_audit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_security_violation(text, text, text, jsonb) FROM anon;

-- 2. Conceder acesso apenas para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_user_profile_optimized_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_learning_content(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_course_enhanced(uuid, uuid) TO authenticated;

-- 3. Funções administrativas apenas para service_role
GRANT EXECUTE ON FUNCTION public.secure_change_user_role(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.secure_create_role(text, text, boolean, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.enhanced_security_audit() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_security_violation(text, text, text, jsonb) TO service_role;

-- 4. Atualizar função get_user_profile_optimized_secure para verificar autorização
CREATE OR REPLACE FUNCTION public.get_user_profile_optimized_secure(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  profile_data jsonb;
  role_data jsonb;
  current_user_id uuid;
  is_admin boolean;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se está autenticado
  IF current_user_id IS NULL THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] Acesso negado: usuário não autenticado';
    RETURN jsonb_build_object('error', 'Acesso negado: autenticação necessária');
  END IF;
  
  -- Verificar se é admin
  is_admin := public.is_user_admin_secure(current_user_id);
  
  -- Verificar autorização: só pode ver próprio perfil ou ser admin
  IF current_user_id != target_user_id AND NOT is_admin THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] Acesso negado: usuário % tentou acessar perfil de %', current_user_id, target_user_id;
    RETURN jsonb_build_object('error', 'Acesso negado: não é possível ver perfil de outro usuário');
  END IF;
  
  -- Log para debug
  RAISE NOTICE '[PROFILE_OPTIMIZED] Buscando perfil para: %', target_user_id;
  
  -- Buscar dados do perfil (limitando campos sensíveis para não-admins)
  IF is_admin OR current_user_id = target_user_id THEN
    -- Admin ou próprio usuário: dados completos
    SELECT jsonb_build_object(
      'id', p.id,
      'email', p.email,
      'name', p.name,
      'company_name', p.company_name,
      'role_id', p.role_id,
      'role', p.role,
      'created_at', p.created_at,
      'updated_at', p.updated_at
    ) INTO profile_data
    FROM public.profiles p
    WHERE p.id = target_user_id;
  ELSE
    -- Outros usuários: dados limitados (sem email)
    SELECT jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'company_name', p.company_name,
      'role', p.role,
      'created_at', p.created_at
    ) INTO profile_data
    FROM public.profiles p
    WHERE p.id = target_user_id;
  END IF;
  
  -- Se não encontrou perfil, retornar null
  IF profile_data IS NULL THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] Perfil não encontrado para: %', target_user_id;
    RETURN NULL;
  END IF;
  
  -- Buscar dados do role
  SELECT jsonb_build_object(
    'id', ur.id,
    'name', ur.name,
    'description', ur.description,
    'permissions', ur.permissions
  ) INTO role_data
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Adicionar role_data ao perfil
  IF role_data IS NOT NULL THEN
    profile_data := profile_data || jsonb_build_object('user_roles', role_data);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role encontrado: %', role_data->>'name';
  ELSE
    profile_data := profile_data || jsonb_build_object('user_roles', null);
    RAISE NOTICE '[PROFILE_OPTIMIZED] Role não encontrado para: %', target_user_id;
  END IF;
  
  -- Log de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    resource_id,
    details,
    severity
  ) VALUES (
    current_user_id,
    'data_access',
    'profile_access',
    target_user_id::text,
    jsonb_build_object(
      'accessed_user', target_user_id,
      'is_own_profile', current_user_id = target_user_id,
      'is_admin_access', is_admin,
      'timestamp', now()
    ),
    CASE WHEN current_user_id != target_user_id THEN 'high' ELSE 'info' END
  );
  
  RAISE NOTICE '[PROFILE_OPTIMIZED] Retornando perfil para: %', profile_data->>'name';
  RETURN profile_data;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '[PROFILE_OPTIMIZED] ERRO: % para usuário %', SQLERRM, target_user_id;
    
    -- Log do erro
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      current_user_id,
      'security_violation',
      'profile_access_error',
      jsonb_build_object(
        'error', SQLERRM,
        'target_user', target_user_id,
        'timestamp', now()
      ),
      'high'
    );
    
    RETURN jsonb_build_object('error', 'Erro interno ao acessar perfil');
END;
$function$;