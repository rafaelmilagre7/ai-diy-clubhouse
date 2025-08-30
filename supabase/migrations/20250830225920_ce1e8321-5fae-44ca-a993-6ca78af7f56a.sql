-- Atualizar função can_access_learning_content para verificar permissões dinamicamente
-- ao invés de hardcoded roles

CREATE OR REPLACE FUNCTION public.can_access_learning_content(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_permissions jsonb;
  has_learning_access boolean := false;
BEGIN
  -- Log da chamada da função para debug
  RAISE NOTICE '[LEARNING ACCESS] Verificando acesso para usuário: %', target_user_id;
  
  -- Buscar permissões do usuário através da tabela user_roles
  SELECT ur.permissions INTO user_permissions
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.role_id = ur.id
  WHERE p.id = target_user_id;
  
  -- Se não encontrou permissões, negar acesso
  IF user_permissions IS NULL THEN
    RAISE NOTICE '[LEARNING ACCESS] Usuário % sem permissões encontradas', target_user_id;
    RETURN false;
  END IF;
  
  -- Verificar se tem permissão de learning
  has_learning_access := COALESCE((user_permissions->>'learning')::boolean, false);
  
  -- Log do resultado
  RAISE NOTICE '[LEARNING ACCESS] Usuário %: permissões=%, learning_access=%', 
    target_user_id, user_permissions, has_learning_access;
  
  -- Log adicional para auditoria
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    action,
    details,
    severity
  ) VALUES (
    target_user_id,
    'learning_access_check',
    'can_access_learning_content',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'permissions', user_permissions,
      'access_granted', has_learning_access,
      'function_version', 'dynamic_permissions_v2'
    ),
    'info'
  );
  
  RETURN has_learning_access;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE NOTICE '[LEARNING ACCESS] Erro ao verificar acesso para %: %', target_user_id, SQLERRM;
    
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      action,
      details,
      severity
    ) VALUES (
      target_user_id,
      'learning_access_error',
      'can_access_learning_content_error',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'error', SQLERRM,
        'function_version', 'dynamic_permissions_v2'
      ),
      'error'
    );
    
    RETURN false;
END;
$function$;

-- Comentário explicativo da mudança
COMMENT ON FUNCTION public.can_access_learning_content(uuid) IS 
'Verifica se usuário pode acessar conteúdo de aprendizado baseado em permissões dinâmicas (permissions.learning = true) ao invés de roles hardcoded. Atualizada para corrigir acesso de usuários hands_on.';