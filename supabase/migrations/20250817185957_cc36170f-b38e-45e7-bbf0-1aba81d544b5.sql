-- Corrigir função de criação de roles para evitar erro de foreign key constraint
CREATE OR REPLACE FUNCTION public.secure_create_role_safe(
  p_name text,
  p_description text DEFAULT NULL,
  p_is_system boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_role_id uuid;
  current_user_id uuid;
  result jsonb;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_user_admin_secure(auth.uid()) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Acesso negado - apenas administradores',
      'error_code', 'ACCESS_DENIED'
    );
  END IF;
  
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se usuário existe (validação extra)
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Usuário não autenticado',
      'error_code', 'UNAUTHENTICATED'
    );
  END IF;
  
  -- Verificar se role já existe
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE name = p_name) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Um papel com este nome já existe',
      'error_code', 'ROLE_EXISTS'
    );
  END IF;
  
  -- Criar o novo role
  INSERT INTO public.user_roles (name, description, is_system, created_at, updated_at)
  VALUES (p_name, p_description, p_is_system, now(), now())
  RETURNING id INTO new_role_id;
  
  -- Log da criação (apenas se o usuário existir no sistema)
  BEGIN
    -- Tentar inserir log de auditoria apenas se o usuário realmente existir
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = current_user_id) THEN
      INSERT INTO public.audit_logs (
        user_id,
        event_type,
        action,
        details,
        severity
      ) VALUES (
        current_user_id,
        'role_management',
        'role_created',
        jsonb_build_object(
          'role_id', new_role_id,
          'role_name', p_name,
          'role_description', p_description,
          'is_system', p_is_system,
          'created_at', now()
        ),
        'info'
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar o log, continuar mesmo assim (não bloquear a criação do role)
      NULL;
  END;
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Papel criado com sucesso',
    'role_id', new_role_id,
    'role_name', p_name
  );
  
  RETURN result;
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Um papel com este nome já existe',
      'error_code', 'ROLE_EXISTS'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Erro interno: ' || SQLERRM,
      'error_code', 'INTERNAL_ERROR'
    );
END;
$$;